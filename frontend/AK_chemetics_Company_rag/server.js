import 'dotenv/config';
import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomBytes, createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import multer from 'multer';
import jwt from 'jsonwebtoken';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RAG_ROOT     = path.resolve(__dirname, '..', '..');
const _localPython = path.join(RAG_ROOT, 'venv', 'bin', 'python3');
const PYTHON = (() => {
  const envPath = process.env.PYTHON_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;  // Railway/Docker: use if it actually exists
  if (fs.existsSync(_localPython))       return _localPython; // local venv
  return 'python3';                                           // system fallback
})();
const AGENT      = path.join(RAG_ROOT, 'agent.py');
const SKILLS_DIR = path.join(RAG_ROOT, 'skills');
const INIT_FILE  = path.join(SKILLS_DIR, '__init__.py');

// Agent script paths
const PM_AGENT      = path.join(RAG_ROOT, 'work_agents', 'Daniel - Project Manager ', 'pm_agent.py');
const PROCESS_AGENT = path.join(RAG_ROOT, 'work_agents', 'Aria - Process Engineer', 'process_agent.py');
const MECH_AGENT    = path.join(RAG_ROOT, 'work_agents', 'Hunter - Mechnical Engineer', 'mechanical_agent.py');

// Agent output file paths
const PM_DIR      = path.join(RAG_ROOT, 'work_agents', 'Daniel - Project Manager ');
const PROCESS_DIR = path.join(RAG_ROOT, 'work_agents', 'Aria - Process Engineer');
const MECH_DIR    = path.join(RAG_ROOT, 'work_agents', 'Hunter - Mechnical Engineer');

// ── Project store ─────────────────────────────────────────────────────────
// DATA_DIR is set on Railway/Docker; locally falls back to PM_DIR (original location)
const PROJECTS_STORE = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'projects_store.json')
  : path.join(PM_DIR, 'projects_store.json');

function loadProjects() {
  if (!fs.existsSync(PROJECTS_STORE)) return [];
  try {
    const arr = JSON.parse(fs.readFileSync(PROJECTS_STORE, 'utf-8'));
    // Backfill missing IDs for projects created before this feature
    let changed = false;
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i].id) { arr[i].id = 'proj_' + randomBytes(4).toString('hex'); changed = true; }
      const migrated = migrateProject(arr[i]);
      if (migrated !== arr[i]) { arr[i] = migrated; changed = true; }
    }
    if (changed) saveProjects(arr);
    return arr;
  } catch { return []; }
}
function saveProjects(arr) {
  fs.writeFileSync(PROJECTS_STORE, JSON.stringify(arr, null, 2));
}
function upsertProject(proj) {
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === proj.id);
  if (idx >= 0) arr[idx] = proj; else arr.unshift(proj);
  saveProjects(arr);
  return proj;
}

function buildDocs(docRegister) {
  const docs = {
    __project: { status: 'draft', publishedAt: null, publishedBy: null, comments: [] },
  };
  for (const doc of (docRegister ?? [])) {
    docs[doc.doc_id] = {
      content: '',
      status: 'pending',
      comments: [],
      agentRun: null,
      submittedAt: null,
      approvedAt: null,
    };
  }
  return docs;
}

function migrateProject(p) {
  if (p.docs) return p; // already migrated
  const docs = buildDocs(p.context?.document_register);
  // Migrate __project status
  if (p.docStatus?.__project) {
    docs.__project = { ...docs.__project, ...p.docStatus.__project, comments: [] };
  }
  // Migrate deliverable content
  for (const [docId, content] of Object.entries(p.context?.deliverables ?? {})) {
    if (docs[docId] && typeof content === 'string' && content.length > 0) {
      docs[docId].content = content;
    }
  }
  // Migrate docStatus per doc
  for (const [docId, ds] of Object.entries(p.docStatus ?? {})) {
    if (docId === '__project') continue;
    if (docs[docId]) {
      docs[docId].status = ds.status ?? 'pending';
      docs[docId].comments = ds.comments ?? [];
    }
  }
  // Migrate processOutput → agentChain + docs[calDocId].agentRun
  const calDocId = findCalcDocId(p.context?.document_register);
  const pumpCalDocId = findPumpCalcDocId(p.context?.document_register);
  const agentChain = {
    processOutput: p.processOutput ?? null,
    mechanicalOutput: p.mechanicalOutput ?? null,
  };
  if (p.processOutput && docs[calDocId]) {
    docs[calDocId].agentRun = {
      output: p.processOutput,
      steps: p.processSteps ?? null,
      ranAt: p.processOutput.generated_at ?? new Date().toISOString(),
    };
    if (docs[calDocId].status === 'pending') docs[calDocId].status = 'in_progress';
  }
  if (p.mechanicalOutput && docs[pumpCalDocId]) {
    docs[pumpCalDocId].agentRun = {
      output: p.mechanicalOutput,
      steps: null,
      ranAt: p.mechanicalOutput.generated_at ?? new Date().toISOString(),
    };
    if (docs[pumpCalDocId].status === 'pending') docs[pumpCalDocId].status = 'in_progress';
  }
  const { docStatus: _ds, processOutput: _po, mechanicalOutput: _mo, processSteps: _ps, ...rest } = p;
  const context = { ...rest.context };
  delete context.deliverables; // moved to docs
  return { ...rest, context, docs, agentChain };
}

// Legacy helper kept for compatibility (no longer used for new projects)
function buildDocStatus(docRegister) {
  const ds = { __project: { status: 'draft', publishedAt: null, publishedBy: null } };
  for (const doc of (docRegister ?? [])) {
    ds[doc.doc_id] = { status: 'pending', comments: [], lastUpdated: new Date().toISOString(), updatedBy: null };
  }
  return ds;
}

// Builds the structured calculation sheet JSON from processSteps results.
// Stored as context.deliverables['1-CAL-XXXX'] (or whatever CAL doc is in the register).
function buildCalcSheet(processSteps, docRegister) {
  const fp = processSteps.step1?.result || {};
  const dc = processSteps.step2?.result || {};
  const hr = processSteps.step3?.result || {};
  const cs = processSteps.step4?.result  || '';
  return {
    _type: 'calc_sheet',
    generated_at: new Date().toISOString(),
    fluid_properties: {
      fluid_code:               fp.fluid_code               ?? null,
      fluid_code_source:        fp.fluid_code_source        ?? null,
      density_kgm3:             fp.density_kgm3             ?? null,
      specific_gravity:         fp.specific_gravity         ?? null,
      dynamic_viscosity_mPas:   fp.dynamic_viscosity_mPas   ?? null,
      vapor_pressure_kPa:       fp.vapor_pressure_kPa_at_temp ?? null,
      corrosive:                fp.corrosive                ?? null,
    },
    design_criteria: {
      normal_flow_m3h:          dc.normal_flow_m3h          ?? null,
      flow_margin_pct:          dc.flow_margin_pct          ?? null,
      rated_flow_m3h:           dc.rated_flow_m3h           ?? null,
      pressure_class:           dc.pressure_class           ?? null,
      corrosion_allowance_mm:   dc.corrosion_allowance_mm   ?? null,
      material_note:            dc.material_note            ?? null,
    },
    hydraulic_results: {
      total_dynamic_head_m:     hr.total_dynamic_head_m     ?? null,
      tdh_display:              hr.tdh_display              ?? null,
      NPSHa_m:                  hr.NPSHa_m                  ?? null,
      static_head_m:            hr.static_head_m            ?? null,
      friction_loss_m:          hr.friction_loss_m          ?? null,
      rated_flow_m3h:           hr.rated_flow_m3h           ?? null,
    },
    calc_summary: cs,
  };
}

function findCalcDocId(docRegister) {
  const doc = (docRegister || []).find(d =>
    d.assigned_to === 'Process Engineer' && d.doc_id?.includes('CAL')
  );
  return doc?.doc_id || '1-CAL-XXXX';
}

// Builds the structured pump calculation sheet JSON from mechanical agent output.
// Stored as context.deliverables['4-CAL-0001'] (or whichever CAL doc is Mechanical Engineer's).
function buildPumpCalcSheet(mechanicalOutput) {
  const calcs = mechanicalOutput?.pump_calculations || {};
  const ps    = mechanicalOutput?.project_summary   || {};
  const fl    = mechanicalOutput?.fluid_properties  || {};
  return {
    _type:         'calc_sheet',
    _subtype:      'pump_calc',
    generated_at:  new Date().toISOString(),
    inputs: {
      fluid_density_kgm3:        calcs.fluid_density_kgm3        ?? fl.density_kgm3              ?? null,
      temperature_c:             ps.temperature_c                ?? null,
      vapor_pressure_kPa:        fl.vapor_pressure_kPa_at_temp   ?? null,
      suction_pressure_barg:     ps.suction_pressure_barg        ?? null,
      discharge_pressure_barg:   ps.discharge_pressure_barg      ?? null,
      rated_flow_m3h:            calcs.rated_flow_m3h            ?? null,
      suction_static_head_m:     ps.suction_static_head_m        ?? null,
      discharge_static_head_m:   ps.discharge_static_head_m      ?? null,
      suction_friction_loss_m:   ps.suction_friction_loss_m      ?? null,
      discharge_friction_loss_m: ps.discharge_friction_loss_m    ?? null,
    },
    calculated: {
      total_suction_head_m:   calcs.total_suction_head_m   ?? null,
      total_discharge_head_m: calcs.total_discharge_head_m ?? null,
      total_dynamic_head_m:   calcs.total_dynamic_head_m   ?? null,
      hydraulic_power_kW:     calcs.hydraulic_power_kW     ?? null,
      specific_speed_Ns:      calcs.specific_speed_Ns      ?? null,
      impeller_type:          calcs.impeller_type          ?? null,
      NPSHa_m:                calcs.NPSHa_m                ?? null,
      NPSHr_estimated_m:      calcs.NPSHr_estimated_m      ?? null,
      npsh_margin_m:          calcs.npsh_margin_m          ?? null,
      npsh_status:            calcs.npsh_status            ?? null,
    },
    outputs: {
      assumed_efficiency:  calcs.assumed_efficiency  ?? null,
      shaft_power_kW:      calcs.shaft_power_kW      ?? null,
      api610_motor_margin: calcs.api610_motor_margin  ?? null,
      required_motor_kW:   calcs.required_motor_kW   ?? null,
      pump_speed_rpm:      calcs.pump_speed_rpm       ?? null,
      specific_gravity:    calcs.specific_gravity     ?? null,
    },
    calculation_notes: calcs.calculation_notes ?? '',
  };
}

function findPumpCalcDocId(docRegister) {
  const doc = (docRegister || []).find(d =>
    d.assigned_to === 'Mechanical Engineer' && d.doc_id?.includes('CAL')
  );
  return doc?.doc_id || '4-CAL-0001';
}

const app = express();
app.use(express.json({ limit: '20mb' }));

// ─── SSE broadcast ────────────────────────────────────────────────────────────
const sseClients = new Set();

function broadcastSync(type, data = {}) {
  const payload = JSON.stringify({ type, ...data, ts: Date.now() });
  for (const client of sseClients) {
    try { client.write(`event: sync\ndata: ${payload}\n\n`); } catch {}
  }
}

app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type':      'text/event-stream',
    'Cache-Control':     'no-cache',
    'Connection':        'keep-alive',
    'X-Accel-Buffering': 'no',   // disable nginx buffering on Railway
  });
  res.write('event: connected\ndata: {}\n\n');
  sseClients.add(res);

  // Keep-alive ping every 25s — prevents Railway's 60s idle timeout
  const keepAlive = setInterval(() => {
    try { res.write(':ping\n\n'); } catch { clearInterval(keepAlive); }
  }, 25000);

  req.on('close', () => {
    sseClients.delete(res);
    clearInterval(keepAlive);
  });
});

// TEMPORARY — remove after data export
const _EXPORT_DB   = path.join(RAG_ROOT, 'app_db.json');
const _EXPORT_UPROJ = path.join(RAG_ROOT, 'user_projects');
app.get('/api/__export', (req, res) => {
  if (req.query.key !== 'export2026') return res.status(403).json({ error: 'forbidden' });
  const db = fs.existsSync(_EXPORT_DB)
    ? JSON.parse(fs.readFileSync(_EXPORT_DB, 'utf-8'))
    : {};
  const projects = fs.existsSync(_EXPORT_UPROJ)
    ? fs.readdirSync(_EXPORT_UPROJ)
    : [];
  res.json({ app_db: db, user_project_ids: projects });
});

// TEMPORARY — streams tar.gz of user_projects/ + app_db.json
app.get('/api/__export-files', (req, res) => {
  if (req.query.key !== 'export2026') return res.status(403).json({ error: 'forbidden' });
  res.setHeader('Content-Type', 'application/gzip');
  res.setHeader('Content-Disposition', 'attachment; filename="export.tar.gz"');
  const targets = [];
  if (fs.existsSync(_EXPORT_UPROJ)) targets.push('user_projects');
  if (fs.existsSync(_EXPORT_DB))    targets.push('app_db.json');
  if (targets.length === 0) return res.end();
  const tar = spawn('tar', ['-czf', '-', ...targets], { cwd: RAG_ROOT });
  tar.stdout.pipe(res);
  tar.stderr.on('data', d => console.error('[export]', d.toString()));
  tar.on('error', err => { console.error('[export] tar error:', err); res.end(); });
});


// ---------------------------------------------------------------------------
// POST /api/query
// Spawns agent.py --json and streams result back as JSON.
// ---------------------------------------------------------------------------
app.post('/api/query', (req, res) => {
  const { question, discipline, source } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  const args = [AGENT, '--json'];
  if (discipline != null) args.push('--discipline', String(discipline));
  if (source)             args.push('--source', source);
  args.push(question.trim());

  const proc = spawn(PYTHON, args, { cwd: RAG_ROOT });

  let stdout = '';
  let stderr = '';

  proc.stdout.on('data', chunk => { stdout += chunk; });
  proc.stderr.on('data', chunk => { stderr += chunk; });

  proc.on('close', code => {
    if (code !== 0) {
      console.error('[agent stderr]', stderr.slice(-300));
      return res.status(500).json({ error: 'Agent process failed.', detail: stderr.slice(-500) });
    }
    try {
      res.json(JSON.parse(stdout));
    } catch {
      res.status(500).json({ error: 'Could not parse agent output.', raw: stdout.slice(0, 300) });
    }
  });

  proc.on('error', err =>
    res.status(500).json({ error: 'Failed to start Python.', detail: err.message })
  );
});


// ---------------------------------------------------------------------------
// GET /api/skills
// Reads skills/ folder dynamically — reflects newly deployed skills.
// ---------------------------------------------------------------------------
app.get('/api/skills', (_req, res) => {
  try {
    const files = fs.readdirSync(SKILLS_DIR)
      .filter(f => f.endsWith('.py') && f !== '__init__.py' && !f.startsWith('_'))
      .sort();

    const skills = files.map(file => {
      const name = file.replace('.py', '');
      const code = fs.readFileSync(path.join(SKILLS_DIR, file), 'utf-8');

      // Find first """ after the function definition, then extract first non-empty line
      const fnIdx = code.indexOf('def check_');
      let description = '';
      if (fnIdx !== -1) {
        const docStart = code.indexOf('"""', fnIdx);
        if (docStart !== -1) {
          const docEnd = code.indexOf('"""', docStart + 3);
          if (docEnd !== -1) {
            const docLines = code.slice(docStart + 3, docEnd)
              .split('\n').map(l => l.trim()).filter(l => l.length > 0);
            description = docLines[0] || '';
          }
        }
      }

      return {
        name,
        slash: `/${name}`,
        file,
        description,
      };
    });

    res.json({ skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------------------------------------------------------------------
// POST /api/skills/deploy
// Saves a new skill file and registers it in skills/__init__.py.
// ---------------------------------------------------------------------------
app.post('/api/skills/deploy', (req, res) => {
  const { name, code } = req.body;

  // Validate skill name (lowercase snake_case)
  if (!name || !/^[a-z][a-z0-9_]*$/.test(name)) {
    return res.status(400).json({ error: 'Skill name must be lowercase snake_case (e.g. insulation_thickness).' });
  }

  const fnName = `check_${name}`;

  // Code must define the expected function
  if (!code || !code.includes(`def ${fnName}(`)) {
    return res.status(400).json({ error: `Code must define a function named '${fnName}'.` });
  }

  const skillFile = path.join(SKILLS_DIR, `${name}.py`);
  const isNew = !fs.existsSync(skillFile);

  // Write skill file
  fs.writeFileSync(skillFile, code, 'utf-8');

  // Update __init__.py only if this is a new skill
  if (isNew) {
    let init = fs.readFileSync(INIT_FILE, 'utf-8');
    const importLine = `from skills.${name} import ${fnName}`;

    // Insert import before the blank line before TOOLS
    init = init.replace('\n\nTOOLS = [', `\n${importLine}\n\nTOOLS = [`);

    // Insert function name into TOOLS list before closing bracket
    init = init.replace('\n]\n', `\n    ${fnName},\n]\n`);

    fs.writeFileSync(INIT_FILE, init, 'utf-8');
  }

  res.json({
    success: true,
    name,
    file: `skills/${name}.py`,
    registered: isNew,
  });
});


// ---------------------------------------------------------------------------
// GET /api/library
// Reads parsed_chunks.json, deduplicates by doc_id, groups by discipline.
// ---------------------------------------------------------------------------
const DISCIPLINE_NAMES = {
  '-1': 'General',
  '0':  'Administration',
  '1':  'Process Technology',
  '2':  'Civil & Site Preparation',
  '3':  'Structural & Buildings',
  '4':  'Equipment',
  '5':  'Piping & Layout',
  '6':  'Insulation',
  '7':  'Coatings',
  '8':  'Instrumentation & Control',
  '9':  'Electrical',
};

app.get('/api/library', (_req, res) => {
  try {
    const chunks = JSON.parse(fs.readFileSync(path.join(RAG_ROOT, 'parsed_chunks.json'), 'utf-8'));

    // Deduplicate by doc_id
    const docMap = new Map();
    for (const chunk of chunks) {
      const m = chunk.metadata || chunk;
      const docId = m.doc_id;
      if (!docId || docMap.has(docId)) continue;
      const disc = m.discipline != null ? m.discipline : -1;
      docMap.set(docId, {
        doc_id:       docId,
        doc_type:     m.doc_type     || '',
        discipline:   disc,
        source_folder: m.source_folder || '',
        revision:     m.revision     || '',
        is_template:  Boolean(m.is_template),
      });
    }

    // Group by discipline
    const groups = new Map();
    for (const doc of docMap.values()) {
      if (!groups.has(doc.discipline)) {
        groups.set(doc.discipline, {
          id:   doc.discipline,
          name: DISCIPLINE_NAMES[String(doc.discipline)] || `Discipline ${doc.discipline}`,
          docs: [],
        });
      }
      groups.get(doc.discipline).docs.push(doc);
    }

    const disciplines = [...groups.values()]
      .sort((a, b) => a.id - b.id)
      .map(g => ({ ...g, docs: g.docs.sort((a, b) => a.doc_id.localeCompare(b.doc_id)) }));

    res.json({ disciplines, total_docs: docMap.size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------------------------------------------------------------------
// GET /api/agents/status
// Returns which agent output files currently exist on disk.
// ---------------------------------------------------------------------------
app.get('/api/agents/status', (_req, res) => {
  const exists = f => fs.existsSync(f);
  res.json({
    pm: {
      project_context: exists(path.join(PM_DIR, 'project_context.json')),
      handoff_brief:   exists(path.join(PM_DIR, 'handoff_brief.md')),
    },
    process: {
      process_output: exists(path.join(PROCESS_DIR, 'process_output.json')),
      calc_summary:   exists(path.join(PROCESS_DIR, 'process_calc_summary.md')),
    },
    mechanical: {
      mechanical_output: exists(path.join(MECH_DIR, 'mechanical_output.json')),
      pump_datasheet:    exists(path.join(MECH_DIR, 'pump_datasheet.md')),
    },
  });
});


// ---------------------------------------------------------------------------
// GET /api/agents/output/:file
// Returns the content of a specific agent output file.
// ---------------------------------------------------------------------------
const OUTPUT_FILE_MAP = {
  'project-context':   path.join(PM_DIR,      'project_context.json'),
  'handoff-brief':     path.join(PM_DIR,      'handoff_brief.md'),
  'process-output':    path.join(PROCESS_DIR, 'process_output.json'),
  'calc-summary':      path.join(PROCESS_DIR, 'process_calc_summary.md'),
  'mechanical-output': path.join(MECH_DIR,    'mechanical_output.json'),
  'pump-datasheet':    path.join(MECH_DIR,    'pump_datasheet.md'),
};

app.get('/api/agents/output/:file', (req, res) => {
  const filePath = OUTPUT_FILE_MAP[req.params.file];
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  if (filePath.endsWith('.json')) {
    try { return res.json(JSON.parse(content)); } catch {}
  }
  res.type('text/plain').send(content);
});


// ---------------------------------------------------------------------------
// Shared SSE helper for PM agent endpoints.
// Streams stderr progress lines as SSE events, then sends final result.
// ---------------------------------------------------------------------------
function runPmAgentSSE(res, args) {
  res.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection:      'keep-alive',
  });

  const proc = spawn(PYTHON, args, { cwd: RAG_ROOT });
  let stdout = '';
  let stderrBuf = '';

  proc.stdout.on('data', chunk => { stdout += chunk; });

  proc.stderr.on('data', chunk => {
    stderrBuf += chunk;
    const lines = stderrBuf.split('\n');
    stderrBuf = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        JSON.parse(line);
        res.write(`event: progress\ndata: ${line}\n\n`);
      } catch {
        // non-JSON stderr (e.g. warnings) — skip
      }
    }
  });

  proc.on('close', code => {
    if (code !== 0) {
      const detail = stderrBuf.trim().slice(-1000) || '(no stderr)';
      res.write(`event: error\ndata: ${JSON.stringify({ error: `PM agent failed (exit ${code}): ${detail}` })}\n\n`);
      res.end();
      return;
    }
    try {
      const ctx = JSON.parse(stdout);
      const id = 'proj_' + randomBytes(4).toString('hex');
      const sessionsConfig = ctx.sessions_config || {};
      const docs = buildDocs(ctx.document_register);
      // Store deliverable content; only PM-assigned docs start in_progress
      for (const [docId, content] of Object.entries(ctx.deliverables ?? {})) {
        if (docs[docId] && typeof content === 'string') {
          docs[docId].content = content;
          const docMeta = (ctx.document_register ?? []).find(d => d.doc_id === docId);
          if (docMeta?.assigned_to === 'PM') docs[docId].status = 'in_progress';
          // Engineer docs stay pending until PM publishes
        }
      }
      const contextToSave = { ...ctx };
      delete contextToSave.deliverables; // moved to docs
      const project = {
        id,
        createdAt: new Date().toISOString(),
        status: 'active',
        context: contextToSave,
        docs,
        agentChain: { processOutput: null, mechanicalOutput: null },
        sessionsConfig,
        sharing: {},
      };
      upsertProject(project);
      fs.writeFileSync(path.join(PM_DIR, 'project_context.json'), JSON.stringify(ctx, null, 2));
      fs.writeFileSync(path.join(PM_DIR, 'handoff_brief.md'), ctx.handoff_brief || '');
      res.write(`event: result\ndata: ${JSON.stringify({ ...ctx, id })}\n\n`);
    } catch {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Could not parse PM agent output', raw: stdout.slice(0, 500) })}\n\n`);
    }
    res.end();
  });

  proc.on('error', err => {
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to start Python', detail: err.message })}\n\n`);
    res.end();
  });
}


// ---------------------------------------------------------------------------
// POST /api/agents/pm
// Accepts { sow_content_b64, sow_filename, end_date }.
// Runs pm_agent.py --json, streams progress via SSE, then sends result.
// ---------------------------------------------------------------------------
app.post('/api/agents/pm', (req, res) => {
  const { sow_content_b64, sow_filename, end_date } = req.body;
  if (!sow_content_b64 || !end_date) {
    return res.status(400).json({ error: 'sow_content_b64 and end_date are required' });
  }

  const ext = (sow_filename || 'sow.docx').endsWith('.docx') ? '.docx' : '.txt';
  const tmpFile = path.join(os.tmpdir(), `sow_${randomBytes(4).toString('hex')}${ext}`);
  fs.writeFileSync(tmpFile, Buffer.from(sow_content_b64, 'base64'));

  runPmAgentSSE(res, [PM_AGENT, '--json', '--sow', tmpFile, '--end-date', end_date]);
});


// ---------------------------------------------------------------------------
// POST /api/agents/pm-demo
// Runs pm_agent.py --demo --json (uses built-in sample SOW).
// ---------------------------------------------------------------------------
app.post('/api/agents/pm-demo', (req, res) => {
  const { end_date } = req.body;
  if (!end_date) return res.status(400).json({ error: 'end_date is required' });

  runPmAgentSSE(res, [PM_AGENT, '--json', '--demo', '--end-date', end_date]);
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/run/process
// Runs process_agent.py --json with SSE step progress.
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/run/process', (req, res) => {
  const arr = loadProjects();
  const proj = arr.find(p => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  // Permission check: project must be published
  if (proj.docs.__project?.status !== 'published') {
    return res.status(403).json({ error: 'Project must be published before running process calculations' });
  }

  // Find the process CAL doc
  const calDocId = findCalcDocId(proj.context?.document_register);
  const calDoc = proj.docs[calDocId];

  // Permission check: doc must not be under_review or approved
  if (calDoc && (calDoc.status === 'under_review' || calDoc.status === 'approved')) {
    return res.status(403).json({ error: 'Document is under review or approved — cannot re-run. Ask PM to send it back first.' });
  }

  const tmpCtx = path.join(os.tmpdir(), `ctx_${proj.id}.json`);
  fs.writeFileSync(tmpCtx, JSON.stringify(proj.context, null, 2));

  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });

  const proc = spawn(PYTHON, [PROCESS_AGENT, '--json', '--context', tmpCtx], { cwd: RAG_ROOT });
  let stdout = '', stderrBuf = '';

  proc.stdout.on('data', chunk => { stdout += chunk; });

  proc.stderr.on('data', chunk => {
    stderrBuf += chunk;
    const lines = stderrBuf.split('\n');
    stderrBuf = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      try { JSON.parse(line); res.write(`event: progress\ndata: ${line}\n\n`); } catch {}
    }
  });

  proc.on('close', code => {
    if (stderrBuf.trim()) console.error('[process-agent stderr]', stderrBuf);
    if (code !== 0) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: `Process agent failed (exit ${code})` })}\n\n`);
      res.end(); return;
    }
    try {
      const result = JSON.parse(stdout);
      fs.writeFileSync(path.join(PROCESS_DIR, 'process_output.json'), JSON.stringify(result, null, 2));
      fs.writeFileSync(path.join(PROCESS_DIR, 'process_calc_summary.md'), result.calc_summary || '');
      const projects = loadProjects();
      const idx = projects.findIndex(p => p.id === req.params.id);
      if (idx >= 0) {
        if (!projects[idx].docs) projects[idx].docs = buildDocs(projects[idx].context?.document_register);
        const calId = findCalcDocId(projects[idx].context?.document_register);
        // Store in agentChain for mechanical to read
        projects[idx].agentChain = { ...(projects[idx].agentChain ?? {}), processOutput: result };
        // Store in docs[calId].agentRun
        if (!projects[idx].docs[calId]) projects[idx].docs[calId] = { content: '', status: 'pending', comments: [], agentRun: null, submittedAt: null, approvedAt: null };
        projects[idx].docs[calId].agentRun = {
          output: result,
          steps: {
            step1: { status: 'done', result: result.fluid_properties },
            step2: { status: 'done', result: result.design_criteria },
            step3: { status: 'done', result: result.hydraulic_results },
            step4: { status: 'done', result: result.calc_summary },
          },
          ranAt: new Date().toISOString(),
        };
        // Write structured calc sheet content into the CAL doc
        projects[idx].docs[calId].content = JSON.stringify(
          buildCalcSheet({ step1: { result: result.fluid_properties }, step2: { result: result.design_criteria }, step3: { result: result.hydraulic_results }, step4: { result: result.calc_summary } }, projects[idx].context?.document_register), null, 2
        );
        // Update doc content for other process deliverables (e.g. 1-PRC-0001)
        if (result.deliverables) {
          for (const [docId, content] of Object.entries(result.deliverables)) {
            if (projects[idx].docs[docId] && typeof content === 'string' && !content.startsWith('[Generation failed')) {
              projects[idx].docs[docId].content = content;
              if (projects[idx].docs[docId].status === 'pending') projects[idx].docs[docId].status = 'in_progress';
            }
          }
        }
        // Set CAL doc to in_progress if it was pending
        if (projects[idx].docs[calId].status === 'pending') projects[idx].docs[calId].status = 'in_progress';
        saveProjects(projects);
        broadcastSync('agent_done', { projectId: req.params.id, agent: 'process' });
      }
      res.write(`event: result\ndata: ${JSON.stringify(result)}\n\n`);
    } catch (parseErr) {
      const snippet = stdout.slice(-500) || '(empty stdout)';
      console.error('[process-agent] JSON parse failed:', parseErr && parseErr.message, 'stdout tail:', snippet);
      res.write(`event: error\ndata: ${JSON.stringify({ error: `Could not parse process agent output` })}\n\n`);
    }
    res.end();
  });

  proc.on('error', err => {
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  });
});

// Legacy alias — keep for backward compat with old frontend code
app.post('/api/agents/process', (req, res) => {
  const { projectId } = req.body ?? {};
  if (!projectId) return res.status(400).json({ error: 'projectId is required for this endpoint' });
  // Delegate to new endpoint
  req.params = { id: projectId };
  // Manually forward to the new handler by constructing a simple internal redirect isn't clean in Express,
  // so we just copy the logic inline via a simple redirect trick using the same app handler:
  res.redirect(307, `/api/projects/${projectId}/run/process`);
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/run/process/step/:step
// Runs a single process calculation step.
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/run/process/step/:step', (req, res) => {
  const stepNum = parseInt(req.params.step, 10);
  if (![1, 2, 3, 4].includes(stepNum)) return res.status(400).json({ error: 'Step must be 1–4' });

  const projectId = req.params.id;
  const arr = loadProjects();
  const proj = arr.find(p => p.id === projectId);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  // Get prior steps from docs[calDocId].agentRun.steps
  const calDocId = findCalcDocId(proj.context?.document_register);
  const priorSteps = proj.docs?.[calDocId]?.agentRun?.steps ?? {};

  const tmpCtx   = path.join(os.tmpdir(), `ctx_${projectId}.json`);
  const tmpPrior = path.join(os.tmpdir(), `prior_${projectId}.json`);
  fs.writeFileSync(tmpCtx,   JSON.stringify(proj.context, null, 2));
  fs.writeFileSync(tmpPrior, JSON.stringify(priorSteps, null, 2));

  const proc = spawn(
    PYTHON,
    [PROCESS_AGENT, '--json', '--step', String(stepNum), '--context', tmpCtx, '--prior', tmpPrior],
    { cwd: RAG_ROOT }
  );
  let stdout = '', stderr = '';
  proc.stdout.on('data', chunk => { stdout += chunk; });
  proc.stderr.on('data', chunk => { stderr += chunk; });

  proc.on('close', code => {
    if (code !== 0) return res.status(500).json({ error: 'Step failed', detail: stderr.slice(-500) });
    try {
      const stepResult = JSON.parse(stdout);
      const idx = arr.findIndex(p => p.id === projectId);
      if (idx >= 0) {
        if (!arr[idx].docs) arr[idx].docs = buildDocs(arr[idx].context?.document_register);
        const calId = findCalcDocId(arr[idx].context?.document_register);
        if (!arr[idx].docs[calId]) arr[idx].docs[calId] = { content: '', status: 'pending', comments: [], agentRun: null, submittedAt: null, approvedAt: null };
        if (!arr[idx].docs[calId].agentRun) arr[idx].docs[calId].agentRun = { output: null, steps: {}, ranAt: new Date().toISOString() };
        if (!arr[idx].docs[calId].agentRun.steps) arr[idx].docs[calId].agentRun.steps = {};
        arr[idx].docs[calId].agentRun.steps[`step${stepNum}`] = {
          status: 'done', result: stepResult.result, completedAt: new Date().toISOString(),
        };
        // When step 4 completes, build the calc sheet content
        const steps = arr[idx].docs[calId].agentRun.steps;
        if (stepNum === 4 && steps.step1 && steps.step2 && steps.step3) {
          arr[idx].docs[calId].content = JSON.stringify(
            buildCalcSheet(steps, arr[idx].context?.document_register), null, 2
          );
        }
        if (arr[idx].docs[calId].status === 'pending') arr[idx].docs[calId].status = 'in_progress';
        saveProjects(arr);
      }
      res.json(stepResult);
    } catch {
      res.status(500).json({ error: 'Could not parse step output', raw: stdout.slice(0, 300) });
    }
  });

  proc.on('error', err => res.status(500).json({ error: err.message }));
});

// Legacy alias — keep for backward compat
app.post('/api/agents/process/step/:step', (req, res) => {
  const { projectId } = req.body ?? {};
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  res.redirect(307, `/api/projects/${projectId}/run/process/step/${req.params.step}`);
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/run/mechanical
// Runs mechanical_agent.py --json, saves output files, returns JSON.
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/run/mechanical', (req, res) => {
  const arr = loadProjects();
  const proj = arr.find(p => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  // Permission: process CAL doc must be approved
  const calDocId = findCalcDocId(proj.context?.document_register);
  const processCalDoc = proj.docs?.[calDocId];
  if (!processCalDoc || processCalDoc.status !== 'approved') {
    return res.status(403).json({ error: 'Process calculations must be approved by PM before running mechanical calculations' });
  }

  const processOutput = proj.agentChain?.processOutput;
  if (!processOutput) return res.status(400).json({ error: 'Process output not found — run Process agent first' });

  // Find mechanical CAL doc
  const pumpCalDocId = findPumpCalcDocId(proj.context?.document_register);
  const mechCalDoc = proj.docs?.[pumpCalDocId];
  if (mechCalDoc && (mechCalDoc.status === 'under_review' || mechCalDoc.status === 'approved')) {
    return res.status(403).json({ error: 'Document is under review or approved — cannot re-run' });
  }

  const tmpCtx = path.join(os.tmpdir(), `proc_${proj.id}.json`);
  fs.writeFileSync(tmpCtx, JSON.stringify(processOutput, null, 2));

  // Stream SSE progress from stderr, final result from stdout
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });

  const proc = spawn(PYTHON, [MECH_AGENT, '--json', '--context', tmpCtx], { cwd: RAG_ROOT });
  let stdout = '', stderrBuf = '';
  proc.stdout.on('data', chunk => { stdout += chunk; });

  proc.stderr.on('data', chunk => {
    stderrBuf += chunk;
    const lines = stderrBuf.split('\n');
    stderrBuf = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      try { JSON.parse(line); res.write(`event: progress\ndata: ${line}\n\n`); } catch {}
    }
  });

  proc.on('close', code => {
    if (code !== 0) {
      console.error('[mech_agent stderr]', stderrBuf.slice(-300));
      res.write(`event: error\ndata: ${JSON.stringify({ error: `Mechanical agent failed (exit ${code})`, detail: stderrBuf.slice(-500) })}\n\n`);
      res.end(); return;
    }
    try {
      const result = JSON.parse(stdout);
      fs.writeFileSync(path.join(MECH_DIR, 'mechanical_output.json'), JSON.stringify(result, null, 2));
      fs.writeFileSync(path.join(MECH_DIR, 'pump_datasheet.md'), result.pump_datasheet || '');
      const pumpCalcSheet = buildPumpCalcSheet(result);
      const projects = loadProjects();
      const idx = projects.findIndex(p => p.id === req.params.id);
      if (idx >= 0) {
        if (!projects[idx].docs) projects[idx].docs = buildDocs(projects[idx].context?.document_register);
        const pumpCalId = findPumpCalcDocId(projects[idx].context?.document_register);
        projects[idx].agentChain = { ...(projects[idx].agentChain ?? {}), mechanicalOutput: result };
        if (!projects[idx].docs[pumpCalId]) projects[idx].docs[pumpCalId] = { content: '', status: 'pending', comments: [], agentRun: null, submittedAt: null, approvedAt: null };
        projects[idx].docs[pumpCalId].agentRun = { output: result, steps: null, ranAt: new Date().toISOString() };
        projects[idx].docs[pumpCalId].content = JSON.stringify(pumpCalcSheet, null, 2);
        if (result.deliverables) {
          for (const [docId, content] of Object.entries(result.deliverables)) {
            if (projects[idx].docs[docId] && typeof content === 'string' && !content.startsWith('[Generation failed')) {
              projects[idx].docs[docId].content = content;
              if (projects[idx].docs[docId].status === 'pending') projects[idx].docs[docId].status = 'in_progress';
            }
          }
        }
        if (projects[idx].docs[pumpCalId].status === 'pending') projects[idx].docs[pumpCalId].status = 'in_progress';
        saveProjects(projects);
        broadcastSync('agent_done', { projectId: req.params.id, agent: 'mechanical' });
      }
      res.write(`event: result\ndata: ${JSON.stringify({ ...result, pumpCalcSheet, pumpCalcDocId: pumpCalDocId })}\n\n`);
    } catch {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Could not parse mechanical agent output', raw: stdout.slice(0, 500) })}\n\n`);
    }
    res.end();
  });

  proc.on('error', err => { res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to start Python', detail: err.message })}\n\n`); res.end(); });
});

// Legacy alias — keep for backward compat
app.post('/api/agents/mechanical', (req, res) => {
  const { projectId } = req.body ?? {};
  if (!projectId) return res.status(400).json({ error: 'projectId is required for this endpoint' });
  res.redirect(307, `/api/projects/${projectId}/run/mechanical`);
});


// ---------------------------------------------------------------------------
// GET /api/projects  — list all projects
// ---------------------------------------------------------------------------
// Return project list without heavy content (doc content text + session content)
app.get('/api/projects', (_req, res) => {
  const projects = loadProjects().map(p => {
    // Strip doc content — just keep status, comments, submittedAt, approvedAt, hasContent, hasAgentRun
    const docs = Object.fromEntries(
      Object.entries(p.docs ?? {}).map(([docId, doc]) => [
        docId,
        docId === '__project'
          ? doc
          : { status: doc.status, comments: doc.comments, submittedAt: doc.submittedAt, approvedAt: doc.approvedAt, hasContent: !!doc.content, hasAgentRun: !!doc.agentRun },
      ])
    );
    // Strip session content from sessionsConfig
    const sessionsConfig = Object.fromEntries(
      Object.entries(p.sessionsConfig ?? {}).map(([docId, sessions]) => [
        docId,
        (sessions || []).map(s => { const { content: _c, ...rest } = s; return rest; }),
      ])
    );
    return { ...p, docs, sessionsConfig };
  });
  res.json(projects);
});

// Full project detail (with deliverable content + session content)
app.get('/api/projects/:id', (req, res) => {
  const arr = loadProjects();
  const proj = arr.find(p => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  res.json(proj);
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/publish
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/publish', (req, res) => {
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });
  if (!arr[idx].docs) arr[idx].docs = buildDocs(arr[idx].context?.document_register);
  arr[idx].docs.__project = { ...arr[idx].docs.__project, status: 'published', publishedAt: new Date().toISOString(), publishedBy: req.body.userName ?? 'PM' };
  // Unlock process engineer docs to in_progress
  const register = arr[idx].context?.document_register ?? [];
  for (const d of register) {
    if (d.assigned_to === 'Process Engineer' && arr[idx].docs[d.doc_id]) {
      if (arr[idx].docs[d.doc_id].status === 'pending') arr[idx].docs[d.doc_id].status = 'in_progress';
    }
  }
  saveProjects(arr);
  broadcastSync('project_published', { projectId: req.params.id });
  res.json({ success: true });
});


// ---------------------------------------------------------------------------
// DELETE /api/projects/:id
// ---------------------------------------------------------------------------
app.delete('/api/projects/:id', (req, res) => {
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });
  arr.splice(idx, 1);
  saveProjects(arr);
  res.json({ success: true });
});


// ---------------------------------------------------------------------------
// PUT /api/projects/:id/complete
// ---------------------------------------------------------------------------
app.put('/api/projects/:id/complete', (req, res) => {
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });
  arr[idx].status = 'completed';
  saveProjects(arr);
  res.json({ success: true });
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/build-reference
// Convert a completed agent project's deliverables into a user_project wiki.
// Writes wiki pages directly (no LLM needed — deliverables are already markdown).
// ---------------------------------------------------------------------------
const ROLE_TO_DISC      = { 'PM': 0, 'Process Engineer': 1, 'Mechanical Engineer': 4 };
const DISC_TO_NAME      = { 0: 'Administration', 1: 'Process Technology', 4: 'Equipment' };

app.post('/api/projects/:id/build-reference', (req, res) => {
  try {
    const projectId = req.params.id;
    const projects  = loadProjects();
    const proj      = projects.find(p => p.id === projectId);
    if (!proj) return res.status(404).json({ error: 'Project not found' });

    const deliverables = {};
    for (const [docId, doc] of Object.entries(proj.docs ?? {})) {
      if (docId !== '__project' && doc.content) deliverables[docId] = doc.content;
    }
    const register     = proj.context?.document_register ?? [];
    const ps           = proj.context?.project_summary ?? {};

    if (Object.keys(deliverables).length === 0)
      return res.status(400).json({ error: 'No deliverables — run agents first.' });

    // ── Create directories ──────────────────────────────────────────────────
    const projDir = path.join(USER_PROJECTS_DIR, projectId);
    const wikiDir = path.join(projDir, 'wiki');
    fs.mkdirSync(wikiDir, { recursive: true });

    const docIds = register.map(d => d.doc_id);

    // ── Write one wiki page per deliverable ─────────────────────────────────
    const written = [];
    for (const doc of register) {
      const content = deliverables[doc.doc_id];
      if (!content) continue;

      const disc     = ROLE_TO_DISC[doc.assigned_to] ?? 0;
      const discName = DISC_TO_NAME[disc] ?? 'Administration';
      const typeM    = (doc.doc_id || '').match(/-([A-Z]+)-/);
      const docType  = typeM ? typeM[1] : (doc.doc_type ?? '');

      // Detect cross-references and append as [[links]]
      const refs = docIds.filter(other => {
        if (other === doc.doc_id) return false;
        const esc = other.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        return new RegExp(esc).test(content);
      });
      const refsSection = refs.length > 0
        ? '\n\n## Referenced Documents\n\n' + refs.map(r => `- [[${r}]]`).join('\n')
        : '';

      const safeTitle = (doc.title ?? doc.doc_id).replace(/"/g, '\\"');
      const header = `---
slug: "${doc.doc_id}"
title: "${safeTitle}"
discipline: ${disc}
discipline_name: "${discName}"
doc_type: "${docType}"
source_folder: "${doc.assigned_to ?? ''}"
revision: "0"
---

# ${doc.doc_id} — ${doc.title ?? doc.doc_id}

`;
      fs.writeFileSync(path.join(wikiDir, `${doc.doc_id}.md`), header + content + refsSection, 'utf-8');
      written.push(doc);
    }

    // ── Build Index.md ───────────────────────────────────────────────────────
    const byRole = {};
    for (const doc of written) {
      const role = doc.assigned_to ?? 'PM';
      if (!byRole[role]) byRole[role] = [];
      byRole[role].push(doc);
    }
    const indexLines = [
      `# ${ps.project_title ?? projectId} — Document Index`,
      '',
      ps.client ? `> ${ps.client}${ps.location ? ' · ' + ps.location : ''}` : '',
      '',
    ];
    for (const [role, docs] of Object.entries(byRole)) {
      indexLines.push(`## ${role}`, '');
      for (const d of docs) indexLines.push(`- [[${d.doc_id}]] — ${d.title ?? d.doc_id}`);
      indexLines.push('');
    }
    fs.writeFileSync(path.join(wikiDir, 'Index.md'), indexLines.join('\n'), 'utf-8');

    // ── Register as user_project ─────────────────────────────────────────────
    const meta = {
      id:             projectId,
      name:           ps.project_title ?? projectId,
      status:         'ready',
      isFromProject:  true,
      files:          written.map(d => ({ name: `${d.doc_id}.md`, size: (deliverables[d.doc_id] ?? '').length })),
      createdAt:      new Date().toISOString(),
    };
    const all      = loadUserProjects();
    const existing = all.findIndex(p => p.id === projectId);
    if (existing >= 0) all[existing] = meta; else all.push(meta);
    saveUserProjects(all);

    res.json({ success: true, pages: written.length, meta });
  } catch (err) {
    console.error('[build-reference]', err);
    res.status(500).json({ error: err.message });
  }
});


// ---------------------------------------------------------------------------
// PUT /api/projects/:id/doc-status
// Body: { docId, status, userName, userRole }
// ---------------------------------------------------------------------------
app.put('/api/projects/:id/doc-status', (req, res) => {
  const { docId, status, userName, userRole } = req.body;
  if (!docId || !status) return res.status(400).json({ error: 'docId and status are required' });

  const VALID = ['pending', 'in_progress', 'under_review', 'approved'];
  if (!VALID.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });

  if (!arr[idx].docs) arr[idx].docs = buildDocs(arr[idx].context?.document_register);
  if (!arr[idx].docs[docId]) arr[idx].docs[docId] = { content: '', status: 'pending', comments: [], agentRun: null, submittedAt: null, approvedAt: null };

  const doc = arr[idx].docs[docId];
  const prev = doc.status;
  doc.status = status;
  if (status === 'under_review') doc.submittedAt = new Date().toISOString();
  if (status === 'approved') doc.approvedAt = new Date().toISOString();

  if (prev !== status) {
    doc.comments.push({
      id: randomBytes(4).toString('hex'), type: 'system',
      text: `Status changed to "${status.replace(/_/g, ' ')}"`,
      author: userName ?? 'System', role: userRole ?? '', timestamp: new Date().toISOString(),
    });
  }

  saveProjects(arr);
  broadcastSync('doc_status_changed', { projectId: req.params.id, docId, status });
  res.json(doc);
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/comment
// Body: { docId, text, userName, userRole }
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/comment', (req, res) => {
  const { docId, text, userName, userRole } = req.body;
  if (!docId || !text?.trim()) return res.status(400).json({ error: 'docId and text are required' });

  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });

  if (!arr[idx].docs) arr[idx].docs = buildDocs(arr[idx].context?.document_register);
  if (!arr[idx].docs[docId]) arr[idx].docs[docId] = { content: '', status: 'pending', comments: [], agentRun: null, submittedAt: null, approvedAt: null };

  arr[idx].docs[docId].comments.push({
    id: randomBytes(4).toString('hex'), type: 'comment',
    text: text.trim(), author: userName ?? 'Unknown', role: userRole ?? '', timestamp: new Date().toISOString(),
  });

  saveProjects(arr);
  res.json(arr[idx].docs[docId]);
});


// ---------------------------------------------------------------------------
// PUT /api/projects/:id/deliverable
// Body: { docId, content }  — saves edited document content into the project store
// ---------------------------------------------------------------------------
app.put('/api/projects/:id/deliverable', (req, res) => {
  const { docId, content } = req.body;
  if (!docId || content == null) return res.status(400).json({ error: 'docId and content are required' });

  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });

  if (!arr[idx].docs) arr[idx].docs = buildDocs(arr[idx].context?.document_register);
  if (!arr[idx].docs[docId]) arr[idx].docs[docId] = { content: '', status: 'pending', comments: [], agentRun: null, submittedAt: null, approvedAt: null };
  arr[idx].docs[docId].content = content;

  saveProjects(arr);
  res.json({ success: true });
});


// ---------------------------------------------------------------------------
// PUT /api/projects/:id/docs/:docId/content — set doc content directly
// ---------------------------------------------------------------------------
app.put('/api/projects/:id/docs/:docId/content', (req, res) => {
  const { content } = req.body;
  if (content == null) return res.status(400).json({ error: 'content is required' });
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });
  if (!arr[idx].docs?.[req.params.docId]) return res.status(404).json({ error: 'Document not found' });
  arr[idx].docs[req.params.docId].content = content;
  saveProjects(arr);
  res.json({ success: true });
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/docs/:docId/submit — engineer submits for PM review
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/docs/:docId/submit', (req, res) => {
  const { userName, userRole } = req.body;
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });
  const doc = arr[idx].docs?.[req.params.docId];
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  if (doc.status !== 'in_progress') return res.status(400).json({ error: 'Only in_progress documents can be submitted' });
  doc.status = 'under_review';
  doc.submittedAt = new Date().toISOString();
  doc.comments.push({ id: randomBytes(4).toString('hex'), type: 'system', text: 'Submitted for PM review', author: userName ?? userRole ?? 'Engineer', role: userRole ?? '', timestamp: new Date().toISOString() });
  saveProjects(arr);
  broadcastSync('doc_submitted', { projectId: req.params.id, docId: req.params.docId });
  res.json(doc);
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/docs/:docId/approve — PM approves a doc
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/docs/:docId/approve', (req, res) => {
  const { userName } = req.body;
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });
  const doc = arr[idx].docs?.[req.params.docId];
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  if (doc.status !== 'under_review') return res.status(400).json({ error: 'Only under_review documents can be approved' });
  doc.status = 'approved';
  doc.approvedAt = new Date().toISOString();
  doc.comments.push({ id: randomBytes(4).toString('hex'), type: 'system', text: 'Approved by PM', author: userName ?? 'PM', role: 'pm', timestamp: new Date().toISOString() });
  // If this is the Process CAL doc, unlock mechanical docs to in_progress
  const calDocId = findCalcDocId(arr[idx].context?.document_register);
  if (req.params.docId === calDocId) {
    const register = arr[idx].context?.document_register ?? [];
    for (const d of register) {
      if (d.assigned_to === 'Mechanical Engineer' && arr[idx].docs[d.doc_id]) {
        if (arr[idx].docs[d.doc_id].status === 'pending') arr[idx].docs[d.doc_id].status = 'in_progress';
      }
    }
  }
  saveProjects(arr);
  broadcastSync('doc_approved', { projectId: req.params.id, docId: req.params.docId });
  res.json(doc);
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/docs/:docId/reject — PM rejects/sends back a doc
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/docs/:docId/reject', (req, res) => {
  const { userName, comment } = req.body;
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });
  const doc = arr[idx].docs?.[req.params.docId];
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  if (doc.status !== 'under_review') return res.status(400).json({ error: 'Only under_review documents can be rejected' });
  doc.status = 'in_progress';
  if (comment?.trim()) {
    doc.comments.push({ id: randomBytes(4).toString('hex'), type: 'comment', text: comment.trim(), author: userName ?? 'PM', role: 'pm', timestamp: new Date().toISOString() });
  }
  doc.comments.push({ id: randomBytes(4).toString('hex'), type: 'system', text: 'Sent back for revision', author: userName ?? 'PM', role: 'pm', timestamp: new Date().toISOString() });
  saveProjects(arr);
  broadcastSync('doc_rejected', { projectId: req.params.id, docId: req.params.docId });
  res.json(doc);
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/export-docx
// Body: { docId, content }  — regenerates the .docx from updated markdown
// ---------------------------------------------------------------------------
const EXPORT_DOCX_SCRIPT = path.join(RAG_ROOT, 'export_docx.py');

// Map doc ID prefix to deliverable directory and static URL base
function resolveDeliverableDir(docId) {
  const disc = docId.split('-')[0];
  if (disc === '0') return { dir: path.join(PM_DIR,      'deliverables'), urlBase: '/files/pm-deliverables' };
  if (disc === '1') return { dir: path.join(PROCESS_DIR, 'deliverables'), urlBase: '/files/process-deliverables' };
  if (disc === '4') return { dir: path.join(MECH_DIR,    'deliverables'), urlBase: '/files/mechanical-deliverables' };
  return                  { dir: path.join(PM_DIR,       'deliverables'), urlBase: '/files/pm-deliverables' };
}

app.post('/api/projects/:id/export-docx', (req, res) => {
  const { docId, content } = req.body;
  if (!docId || content == null) return res.status(400).json({ error: 'docId and content are required' });

  const safeId               = docId.replace(/\//g, '_').replace(/\./g, '_');
  const { dir, urlBase }     = resolveDeliverableDir(docId);
  const outputPath           = path.join(dir, `${safeId}.docx`);

  const py = spawn(PYTHON, [EXPORT_DOCX_SCRIPT, '--output', outputPath]);
  py.stdin.write(content, 'utf-8');
  py.stdin.end();

  let stderr = '';
  py.stderr.on('data', d => { stderr += d.toString(); });

  py.on('close', code => {
    if (code !== 0) return res.status(500).json({ error: stderr || 'export_docx.py failed' });
    res.json({ success: true, url: `${urlBase}/${safeId}.docx` });
  });
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/deliverable-chat
// Body: { docId, message, content, history }
// Uses Gemini with the document as context for AI-assisted revisions.
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/deliverable-chat', async (req, res) => {
  const { docId, message, content, history } = req.body;
  if (!docId || !message?.trim()) return res.status(400).json({ error: 'docId and message are required' });

  const arr = loadProjects();
  const proj = arr.find(p => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GOOGLE_API_KEY not set' });

  const summary = proj.context?.project_summary ?? {};

  const systemInstruction = `You are an expert engineering document assistant helping a Project Manager review and revise project deliverables.

CURRENT DOCUMENT (${docId}):
${content}

PROJECT CONTEXT:
- Project: ${summary.project_title ?? 'Engineering Project'}
- Client: ${summary.client ?? 'N/A'}
- Equipment: ${summary.equipment_type ?? 'N/A'}
- Fluid: ${summary.fluid ?? 'N/A'}
- Flow Rate: ${summary.flow_rate_m3h ?? 'N/A'} m³/h
- Design Pressure: ${summary.design_pressure_bar ?? 'N/A'} bar
- Temperature: ${summary.temperature_c ?? 'N/A'} °C

You can answer questions, suggest targeted edits, or generate a full revised version of the document.
If you produce a FULL revised document, wrap the complete markdown content in <document> and </document> XML tags.
Your explanation or reply text goes outside those tags.
Keep replies concise and professional.`;

  // Build conversation contents from history
  const contents = [];
  for (const msg of (history ?? [])) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  }
  contents.push({ role: 'user', parts: [{ text: message.trim() }] });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
      contents,
    });

    const fullText = result.text ?? '';

    // Extract revised document if AI wrapped it in <document> tags
    const docMatch = fullText.match(/<document>([\s\S]*?)<\/document>/);
    const revisedContent = docMatch ? docMatch[1].trim() : undefined;
    const reply = fullText.replace(/<document>[\s\S]*?<\/document>/g, '').trim()
      || (revisedContent ? 'Here is the revised document — click Apply to update the editor.' : '');

    res.json({ reply, revisedContent });
  } catch (e) {
    console.error('[deliverable-chat]', e);
    res.status(500).json({ error: e.message || 'AI request failed' });
  }
});


// ---------------------------------------------------------------------------
// PUT /api/projects/:id/sessions-config
// Body: { docId, sessions: [...] }  — PM saves updated session list (release toggles etc.)
// ---------------------------------------------------------------------------
app.put('/api/projects/:id/sessions-config', (req, res) => {
  const { docId, sessions } = req.body;
  if (!docId || !Array.isArray(sessions)) return res.status(400).json({ error: 'docId and sessions array are required' });

  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });

  if (!arr[idx].sessionsConfig) arr[idx].sessionsConfig = {};
  arr[idx].sessionsConfig[docId] = sessions;

  saveProjects(arr);
  broadcastSync('sessions_updated', { projectId: req.params.id, docId });
  res.json({ success: true, sessionsConfig: arr[idx].sessionsConfig });
});


// ---------------------------------------------------------------------------
// PUT /api/projects/:id/session-content
// Body: { docId, sessionId, content }  — engineer/PM saves edits to a session slice
// ---------------------------------------------------------------------------
app.put('/api/projects/:id/session-content', (req, res) => {
  const { docId, sessionId, content } = req.body;
  if (!docId || !sessionId || content == null) return res.status(400).json({ error: 'docId, sessionId, and content are required' });

  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });

  if (!arr[idx].sessionsConfig) arr[idx].sessionsConfig = {};
  const sessions = arr[idx].sessionsConfig[docId] ?? [];
  arr[idx].sessionsConfig[docId] = sessions.map(s =>
    s.id === sessionId ? { ...s, content, lastEditedAt: new Date().toISOString() } : s
  );

  saveProjects(arr);
  res.json({ success: true });
});


// ---------------------------------------------------------------------------
// PUT /api/projects/:id/sharing
// Body: { docId, role, shared }  — PM toggles sharing a document with a role
// ---------------------------------------------------------------------------
app.put('/api/projects/:id/sharing', (req, res) => {
  const { docId, role, shared } = req.body;
  if (!docId || !role || typeof shared !== 'boolean') return res.status(400).json({ error: 'docId, role, and shared (boolean) are required' });

  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });

  if (!arr[idx].sharing) arr[idx].sharing = {};
  if (!arr[idx].sharing[docId]) arr[idx].sharing[docId] = {};
  arr[idx].sharing[docId][role] = shared;

  saveProjects(arr);
  res.json({ success: true, sharing: arr[idx].sharing });
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/suggest-sessions
// Body: { docId }  — PM triggers LLM session splitting for one document
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/suggest-sessions', async (req, res) => {
  const { docId, role } = req.body;
  if (!docId) return res.status(400).json({ error: 'docId is required' });

  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });

  const content = arr[idx].docs?.[docId]?.content ?? arr[idx].context?.deliverables?.[docId];
  if (!content || typeof content !== 'string') return res.status(400).json({ error: 'No deliverable content found for this doc' });

  // Run a small inline Python script that imports pm_agent and calls suggest_sessions_config
  const pmDir = path.join(RAG_ROOT, 'work_agents', 'Daniel - Project Manager ');
  const envPath = path.join(RAG_ROOT, '.env');
  const script = `
import sys, json
sys.path.insert(0, ${JSON.stringify(RAG_ROOT)})
sys.path.insert(0, ${JSON.stringify(pmDir)})
import re, os
from dotenv import load_dotenv
load_dotenv(${JSON.stringify(envPath)})
from google import genai
from pm_agent import suggest_sessions_config, extract_session_content_py
client = genai.Client(api_key=os.environ['GOOGLE_API_KEY'])
doc_id = sys.argv[1]
content = open(sys.argv[2]).read()
sessions = suggest_sessions_config(doc_id, content, client)
for s in sessions:
    s['content'] = extract_session_content_py(content, s.get('headings', []))
    s.setdefault('released', False)
print(json.dumps(sessions))
`;

  const { tmpdir } = await import('os');
  const tmpScript = path.join(tmpdir(), `suggest_sessions_${Date.now()}.py`);
  const tmpContent = path.join(tmpdir(), `doc_content_${Date.now()}.txt`);

  try {
    fs.writeFileSync(tmpScript, script);
    fs.writeFileSync(tmpContent, content, 'utf-8');

    const { promisify } = await import('util');
    const execFile = promisify((await import('child_process')).execFile);
    const { stdout } = await execFile(PYTHON, [tmpScript, docId, tmpContent], { timeout: 120000 });

    let sessions = JSON.parse(stdout.trim());

    // If a specific role was requested, only keep sessions owned by that role
    if (role) {
      sessions = sessions.filter(s => s.owner === role);
    }

    if (!arr[idx].sessionsConfig) arr[idx].sessionsConfig = {};
    // Merge into existing sessions for this doc (don't overwrite other roles)
    const existing = arr[idx].sessionsConfig[docId] || [];
    const existingOtherRoles = existing.filter(s => !sessions.some(ns => ns.owner === s.owner));
    arr[idx].sessionsConfig[docId] = [...existingOtherRoles, ...sessions];
    saveProjects(arr);

    res.json({ success: true, sessions: arr[idx].sessionsConfig[docId] });
  } catch (e) {
    res.status(500).json({ error: e.message || 'suggest-sessions failed' });
  } finally {
    try { fs.unlinkSync(tmpScript); } catch {}
    try { fs.unlinkSync(tmpContent); } catch {}
  }
});


// ---------------------------------------------------------------------------
// DELETE /api/projects/:id/delete-summary
// Body: { version } — remove a summary version
// ---------------------------------------------------------------------------
app.delete('/api/projects/:id/delete-summary', (req, res) => {
  const { version } = req.body;
  if (!version) return res.status(400).json({ error: 'version is required' });

  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });

  arr[idx].context.deliverable_summaries = (arr[idx].context?.deliverable_summaries ?? [])
    .filter(s => s.version !== version);
  saveProjects(arr);
  res.json({ success: true });
});


// PUT /api/projects/:id/update-summary
// Body: { version, content } — update content of an existing summary version
// ---------------------------------------------------------------------------
app.put('/api/projects/:id/update-summary', (req, res) => {
  const { version, content } = req.body;
  if (!version || content == null) return res.status(400).json({ error: 'version and content are required' });

  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });

  const summaries = arr[idx].context?.deliverable_summaries ?? [];
  const updated = summaries.map(s => s.version === version ? { ...s, content, updatedAt: new Date().toISOString() } : s);
  if (!arr[idx].context) arr[idx].context = {};
  arr[idx].context.deliverable_summaries = updated;
  saveProjects(arr);

  res.json({ success: true });
});


// POST /api/projects/:id/export-summary-docx
// Body: { version, content } — convert summary markdown to .docx in pm-deliverables
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/export-summary-docx', (req, res) => {
  const { version, content } = req.body;
  if (!version || content == null) return res.status(400).json({ error: 'version and content are required' });

  const filename   = `summary_v${version}`;
  const outputPath = path.join(PM_DIR, 'deliverables', `${filename}.docx`);

  const py = spawn(PYTHON, [EXPORT_DOCX_SCRIPT, '--output', outputPath]);
  py.stdin.write(content, 'utf-8');
  py.stdin.end();

  let stderr = '';
  py.stderr.on('data', d => { stderr += d.toString(); });
  py.on('close', code => {
    if (code !== 0) return res.status(500).json({ error: stderr || 'export_docx.py failed' });
    res.json({ success: true, url: `/files/pm-deliverables/${filename}.docx` });
  });
});


// POST /api/projects/:id/summarize-deliverables
// Calls Gemini to summarize all deliverables; appends a versioned entry.
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/summarize-deliverables', async (req, res) => {
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });

  const proj = arr[idx];
  const deliverables = {};
  for (const [docId, doc] of Object.entries(proj.docs ?? {})) {
    if (docId !== '__project' && doc.content) deliverables[docId] = doc.content;
  }
  const docRegister  = proj.context?.document_register ?? [];

  const entries = Object.entries(deliverables).filter(([, v]) => typeof v === 'string' && v.length > 0);
  if (entries.length === 0) return res.status(400).json({ error: 'No deliverable content found to summarize' });

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
  const docMap = Object.fromEntries(docRegister.map(d => [d.doc_id, d]));
  const projectTitle = proj.context?.project_summary?.project_title ?? 'Untitled Project';

  let prompt = `You are an engineering document analyst summarizing project deliverables.\n`;
  prompt += `Project: ${projectTitle}\n\n`;
  prompt += `For each document below, write a concise 3–5 sentence summary covering: what the document is, its key findings or content, and its significance to the project.\n\n`;

  for (const [docId, content] of entries) {
    const title = docMap[docId]?.title ?? docId;
    let body = '';
    try {
      const parsed = JSON.parse(content);
      body = JSON.stringify(parsed, null, 2).slice(0, 2500);
    } catch {
      body = content.slice(0, 2500);
    }
    prompt += `## ${docId}: ${title}\n${body}\n\n---\n\n`;
  }
  prompt += `Respond with a well-formatted markdown document. Use ## headings matching each document ID and title. Write 3–5 sentences per document. Be concise and technical.`;

  try {
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    const summaryContent = response.text ?? '';

    const existing = proj.context?.deliverable_summaries ?? [];
    const version  = existing.length + 1;
    const newEntry = { version, createdAt: new Date().toISOString(), content: summaryContent };

    if (!proj.context) proj.context = {};
    proj.context.deliverable_summaries = [...existing, newEntry];
    arr[idx] = proj;
    saveProjects(arr);

    res.json({ version, content: summaryContent, total: proj.context.deliverable_summaries.length });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Summarize failed' });
  }
});


// ---------------------------------------------------------------------------
// Wiki Knowledge Base — paths & in-memory index
// ---------------------------------------------------------------------------
const WIKI_KB_DIR       = path.join(RAG_ROOT, 'wiki_kb');
const WIKI_DIR          = path.join(WIKI_KB_DIR, 'wiki');
const WIKI_ASK          = path.join(WIKI_KB_DIR, 'src', 'ask.py');
const WIKI_ASK_GENERIC  = path.join(WIKI_KB_DIR, 'src', 'ask_generic.py');

let _wikiIndex = null;  // cached on first request

function buildWikiIndex() {
  if (_wikiIndex) return _wikiIndex;

  const indexPath = path.join(WIKI_DIR, 'Index.md');
  if (!fs.existsSync(indexPath)) return { disciplines: [], totalPages: 0, totalTables: 0, raw: '' };

  const raw = fs.readFileSync(indexPath, 'utf-8');

  const disciplines = [];
  let current = null;
  let currentCategory = null;

  for (const line of raw.split('\n')) {
    // Discipline header: ## 0 Administration
    const discMatch = line.match(/^## (\d+)\s+(.+)/);
    if (discMatch) {
      current = { id: parseInt(discMatch[1]), name: discMatch[2].trim(), description: '', categories: [] };
      currentCategory = null;
      disciplines.push(current);
      continue;
    }
    if (!current) continue;

    // Discipline description (italic)
    if (line.startsWith('_') && line.endsWith('_') && !currentCategory) {
      current.description = line.slice(1, -1);
      continue;
    }

    // Category header: **Procedure** or **SQL Tables**
    const catMatch = line.match(/^\*\*(.+?)\*\*/);
    if (catMatch) {
      currentCategory = { name: catMatch[1].replace(/ _.*$/, ''), items: [] };
      current.categories.push(currentCategory);
      continue;
    }

    if (!currentCategory) continue;

    // Wiki page entry: - [[slug]] — Title
    const wikiMatch = line.match(/^- \[\[(.+?)\]\]\s*(?:—|-)\s*(.+)/);
    if (wikiMatch) {
      currentCategory.items.push({ type: 'page', slug: wikiMatch[1], title: wikiMatch[2].trim() });
      continue;
    }

    // SQL table entry: - `doc_id` → table `table_name` (N rows) — cols: ...
    const sqlMatch = line.match(/^- `(.+?)` → table `(.+?)` \((\d+) rows?\)/);
    if (sqlMatch) {
      currentCategory.items.push({ type: 'sql', docId: sqlMatch[1], table: sqlMatch[2], rows: parseInt(sqlMatch[3]) });
      continue;
    }
  }

  // Build filename index for search (slug → first line as title)
  const slugIndex = [];
  try {
    for (const f of fs.readdirSync(WIKI_DIR)) {
      if (!f.endsWith('.md') || f === 'Index.md') continue;
      const slug = f.replace(/\.md$/, '');
      const first = fs.readFileSync(path.join(WIKI_DIR, f), 'utf-8').split('\n').slice(0, 10).join('\n');
      const titleMatch = first.match(/^title:\s*"?(.+?)"?\s*$/m) || first.match(/^#\s+(.+)/m);
      slugIndex.push({ slug, title: titleMatch ? titleMatch[1] : slug.replace(/_/g, ' ') });
    }
  } catch {}

  const totalPages  = slugIndex.length;
  const totalTables = disciplines.reduce((n, d) =>
    n + d.categories.reduce((m, c) => m + c.items.filter(i => i.type === 'sql').length, 0), 0);

  _wikiIndex = { disciplines, totalPages, totalTables, slugIndex };
  return _wikiIndex;
}


// ---------------------------------------------------------------------------
// GET /api/wiki/index
// ---------------------------------------------------------------------------
app.get('/api/wiki/index', (_req, res) => {
  try {
    const idx = buildWikiIndex();
    res.json({ disciplines: idx.disciplines, totalPages: idx.totalPages, totalTables: idx.totalTables });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------------------------------------------------------------------
// GET /api/wiki/page/:slug
// ---------------------------------------------------------------------------
app.get('/api/wiki/page/:slug', (req, res) => {
  try {
    const slug = req.params.slug;
    const filePath = path.join(WIKI_DIR, `${slug}.md`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: `Page "${slug}" not found` });

    const raw = fs.readFileSync(filePath, 'utf-8');

    // Parse frontmatter
    let content = raw;
    let meta = {};
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (fmMatch) {
      content = fmMatch[2];
      for (const line of fmMatch[1].split('\n')) {
        const kv = line.match(/^(\w+):\s*"?(.+?)"?\s*$/);
        if (kv) meta[kv[1]] = kv[2];
      }
    }

    // Extract wiki links
    const links = [...content.matchAll(/\[\[(.+?)\]\]/g)].map(m => m[1]);

    res.json({ slug, title: meta.title || slug.replace(/_/g, ' '), meta, content, links });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------------------------------------------------------------------
// GET /api/wiki/search?q=...
// ---------------------------------------------------------------------------
app.get('/api/wiki/search', (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase().trim();
    if (!q) return res.json({ results: [] });

    const idx = buildWikiIndex();
    const terms = q.split(/\s+/);
    const results = (idx.slugIndex || [])
      .filter(entry => {
        const haystack = (entry.slug + ' ' + entry.title).toLowerCase();
        return terms.every(t => haystack.includes(t));
      })
      .slice(0, 30)
      .map(e => ({ slug: e.slug, title: e.title }));

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------------------------------------------------------------------
// POST /api/wiki/query
// Body: { question }  — runs ask.py with --json-stream (for retry support) and returns JSON
// ---------------------------------------------------------------------------
app.post('/api/wiki/query', (req, res) => {
  const { question } = req.body;
  if (!question?.trim()) return res.status(400).json({ error: 'question is required' });

  const proc = spawn(PYTHON, [WIKI_ASK, '--json-stream', question.trim()], { cwd: WIKI_KB_DIR });
  let stdout = '';
  let stderr = '';

  proc.stdout.on('data', chunk => { stdout += chunk; });
  proc.stderr.on('data', chunk => { stderr += chunk; });

  proc.on('close', code => {
    if (code !== 0) {
      console.error('[wiki ask stderr]', stderr.slice(-500));
      const isQuota = stderr.includes('RESOURCE_EXHAUSTED') || stderr.includes('quota') || stderr.includes('429');
      const friendlyError = isQuota
        ? 'Gemini API quota exceeded — please wait a moment and try again.'
        : 'Wiki query failed';
      return res.status(500).json({ error: friendlyError, detail: stderr.slice(-500) });
    }
    // Parse JSON lines — find the answer event
    let answer = '';
    for (const line of stdout.split('\n')) {
      if (!line.trim()) continue;
      try {
        const evt = JSON.parse(line);
        if (evt.type === 'answer') { answer = evt.content; break; }
      } catch { /* skip non-JSON lines */ }
    }
    res.json({ answer: answer || '[No answer generated]' });
  });

  proc.on('error', err =>
    res.status(500).json({ error: 'Failed to start Python', detail: err.message })
  );
});


// ---------------------------------------------------------------------------
// GET /api/wiki/graph  — knowledge-graph nodes + edges from [[wiki links]]
// Cached in memory; rebuilt once per hour.
// ---------------------------------------------------------------------------
let _graphCache = null;
let _graphCacheTime = 0;

function buildWikiGraph() {
  if (!fs.existsSync(WIKI_DIR)) return { nodeMap: new Map(), rawEdges: [] };

  const files = fs.readdirSync(WIKI_DIR).filter(f => f.endsWith('.md') && f !== 'Index.md');
  const nodeMap  = new Map();  // slug → { id, title, discipline, doc_type, source_folder }
  const rawEdges = [];         // { source, target }

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    let raw;
    try { raw = fs.readFileSync(path.join(WIKI_DIR, file), 'utf-8'); } catch { continue; }

    // Parse frontmatter
    let meta = { slug, title: slug.replace(/_/g, ' '), discipline: -1, doc_type: '', source_folder: '', source_doc: '' };
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      for (const line of fmMatch[1].split('\n')) {
        const kv = line.match(/^(\w+):\s*"?(.+?)"?\s*$/);
        if (kv) {
          const [, k, v] = kv;
          if (k === 'title')              meta.title = v;
          else if (k === 'discipline')    meta.discipline = parseInt(v) || -1;
          else if (k === 'doc_type')      meta.doc_type = v;
          else if (k === 'source_folder') meta.source_folder = v;
          else if (k === 'source_doc')    meta.source_doc = v;
        }
      }
    }
    nodeMap.set(slug, meta);

    // Extract [[target]] and [[target|label]] links
    for (const m of raw.matchAll(/\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g)) {
      rawEdges.push({ source: slug, target: m[1].trim() });
    }
  }

  return { nodeMap, rawEdges };
}

app.get('/api/wiki/graph', (req, res) => {
  try {
    const now = Date.now();
    if (!_graphCache || now - _graphCacheTime > 3_600_000) {
      _graphCache = buildWikiGraph();
      _graphCacheTime = now;
    }
    const { nodeMap, rawEdges } = _graphCache;

    const discFilter = req.query.discipline !== undefined && req.query.discipline !== ''
      ? parseInt(req.query.discipline) : null;
    const limit = Math.min(parseInt(req.query.limit || '200'), 600);

    // Filter nodes by discipline
    const filtered = discFilter !== null
      ? new Map([...nodeMap].filter(([, v]) => v.discipline === discFilter))
      : nodeMap;

    // Only keep edges where both ends are in the filtered set
    const edges = rawEdges.filter(e => filtered.has(e.source) && filtered.has(e.target));

    // Degree count
    const degree = new Map();
    for (const { source, target } of edges) {
      degree.set(source, (degree.get(source) || 0) + 1);
      degree.set(target, (degree.get(target) || 0) + 1);
    }

    // Sort by degree desc, take top-limit
    let nodes = [...filtered.values()]
      .sort((a, b) => (degree.get(b.slug) || 0) - (degree.get(a.slug) || 0))
      .slice(0, limit)
      .map(n => ({ id: n.slug, title: n.title, discipline: n.discipline, doc_type: n.doc_type, source_folder: n.source_folder, source_doc: n.source_doc || '', degree: degree.get(n.slug) || 0 }));

    const nodeIds = new Set(nodes.map(n => n.id));

    // Deduplicated edges within kept nodes
    const edgeSet = new Set();
    const finalEdges = edges.filter(e => {
      if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) return false;
      const key = [e.source, e.target].sort().join('→');
      if (edgeSet.has(key)) return false;
      edgeSet.add(key); return true;
    });

    res.json({
      nodes, edges: finalEdges,
      meta: { total_nodes: filtered.size, shown_nodes: nodes.length, total_edges: edges.length, shown_edges: finalEdges.length },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------------------------------------------------------------------
// User Projects — custom Karpathy RAG per project
// ---------------------------------------------------------------------------
const DATA_DIR = process.env.DATA_DIR || RAG_ROOT;
const USER_PROJECTS_DIR  = path.join(DATA_DIR, 'user_projects');
const USER_PROJECTS_META = path.join(USER_PROJECTS_DIR, 'meta.json');
const ORCHESTRATOR       = path.join(RAG_ROOT, 'wiki_kb', 'src', 'orchestrator.py');

if (!fs.existsSync(USER_PROJECTS_DIR)) fs.mkdirSync(USER_PROJECTS_DIR, { recursive: true });

function loadUserProjects() {
  if (!fs.existsSync(USER_PROJECTS_META)) return [];
  try { return JSON.parse(fs.readFileSync(USER_PROJECTS_META, 'utf-8')); } catch { return []; }
}
function saveUserProjects(arr) {
  fs.writeFileSync(USER_PROJECTS_META, JSON.stringify(arr, null, 2));
}

const upload = multer({ dest: path.join(USER_PROJECTS_DIR, '_uploads') });

// GET /api/user-projects — list by session
app.get('/api/user-projects', (req, res) => {
  const sid = req.query.session_id;
  const all = loadUserProjects();
  res.json(sid ? all.filter(p => p.session_id === sid) : all);
});

// GET /api/user-projects/:id — detail + status
app.get('/api/user-projects/:id', (req, res) => {
  const proj = loadUserProjects().find(p => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: 'Not found' });
  // Read latest status from disk
  const statusFile = path.join(USER_PROJECTS_DIR, proj.id, 'status.json');
  if (fs.existsSync(statusFile)) {
    try { Object.assign(proj, JSON.parse(fs.readFileSync(statusFile, 'utf-8'))); } catch {}
  }
  res.json(proj);
});

// GET /api/user-projects/:id/status — lightweight poll
app.get('/api/user-projects/:id/status', (req, res) => {
  const statusFile = path.join(USER_PROJECTS_DIR, req.params.id, 'status.json');
  if (!fs.existsSync(statusFile)) return res.json({ status: 'unknown' });
  try { res.json(JSON.parse(fs.readFileSync(statusFile, 'utf-8'))); }
  catch { res.json({ status: 'unknown' }); }
});

// GET /api/user-projects/:id/log — fetch pipeline log
app.get('/api/user-projects/:id/log', (req, res) => {
  const logFile = path.join(USER_PROJECTS_DIR, req.params.id, 'pipeline.log');
  if (!fs.existsSync(logFile)) return res.json({ log: '' });
  const content = fs.readFileSync(logFile, 'utf-8');
  res.json({ log: content.slice(-5000) });
});

// POST /api/user-projects — create + upload files + start pipeline
app.post('/api/user-projects', upload.array('files'), (req, res) => {
  const name = (req.body.name || 'Untitled Project').trim();
  const id = 'uproj_' + randomBytes(6).toString('hex');
  const projDir    = path.join(USER_PROJECTS_DIR, id);
  const sourceDir  = path.join(projDir, 'source');

  fs.mkdirSync(sourceDir, { recursive: true });
  fs.mkdirSync(path.join(projDir, 'raw'), { recursive: true });
  fs.mkdirSync(path.join(projDir, 'wiki'), { recursive: true });
  fs.mkdirSync(path.join(projDir, 'db'), { recursive: true });

  let folderNames = [];
  try { folderNames = JSON.parse(req.body.folder_names || '[]'); } catch {}
  const files = (req.files || []).map((f, i) => {
    const dest = path.join(sourceDir, f.originalname);
    fs.renameSync(f.path, dest);
    return { name: f.originalname, size: f.size, folder: folderNames[i] || null };
  });

  const sid  = req.headers['x-session-id'] || null;
  const meta = { id, name, files, status: 'processing', created_at: new Date().toISOString(), session_id: sid };

  // Write initial status
  fs.writeFileSync(path.join(projDir, 'status.json'), JSON.stringify({ status: 'processing', stage: 'starting' }));

  // Save to meta list
  const all = loadUserProjects();
  all.push(meta);
  saveUserProjects(all);

  // Spawn pipeline in background
  const logStream = fs.createWriteStream(path.join(projDir, 'pipeline.log'));
  const proc = spawn(PYTHON, [
    ORCHESTRATOR,
    '--project-root', projDir,
    '--source', sourceDir,
    '--stage', 'all',
  ], { cwd: path.join(RAG_ROOT, 'wiki_kb') });

  const stderrChunks = [];
  proc.stdout.pipe(logStream);
  proc.stderr.on('data', chunk => { stderrChunks.push(chunk.toString()); logStream.write(chunk); });

  proc.on('close', code => {
    logStream.end();
    const finalStatus = code === 0 ? 'ready' : 'failed';
    const statusObj = { status: finalStatus, exit_code: code };
    if (code !== 0) {
      const logPath = path.join(projDir, 'pipeline.log');
      try {
        const fullLog = fs.readFileSync(logPath, 'utf-8');
        statusObj.error = stderrChunks.join('').slice(-2000) || fullLog.slice(-2000);
      } catch { statusObj.error = stderrChunks.join('').slice(-2000); }
    }
    fs.writeFileSync(path.join(projDir, 'status.json'), JSON.stringify(statusObj, null, 2));
    const projects = loadUserProjects();
    const p = projects.find(x => x.id === id);
    if (p) { p.status = finalStatus; saveUserProjects(projects); }
  });

  res.json(meta);
});

// GET /api/user-projects/:id/manifest — ingested file list with track info
app.get('/api/user-projects/:id/manifest', (req, res) => {
  const manifestPath = path.join(USER_PROJECTS_DIR, req.params.id, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return res.json({ files: [] });
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const files = manifest.map(m => ({
      doc_id:      m.doc_id,
      source_file: path.basename(m.source_file || ''),
      track:       m.track,
    }));
    res.json({ files });
  } catch { res.json({ files: [] }); }
});

// GET /api/user-projects/:id/wiki-files — list of wiki pages with metadata
app.get('/api/user-projects/:id/wiki-files', (req, res) => {
  try {
    const wikiDir = path.join(USER_PROJECTS_DIR, req.params.id, 'wiki');
    if (!fs.existsSync(wikiDir)) return res.json({ files: [] });
    const files = fs.readdirSync(wikiDir)
      .filter(f => f.endsWith('.md') && f !== 'Index.md')
      .map(f => {
        const slug = f.replace(/\.md$/, '');
        let title = slug;
        let source_doc = '';
        try {
          const raw = fs.readFileSync(path.join(wikiDir, f), 'utf-8');
          const mt = raw.match(/^title:\s*"?(.+?)"?\s*$/m);
          if (mt) title = mt[1];
          const ms = raw.match(/^source_doc:\s*"?(.+?)"?\s*$/m);
          if (ms) source_doc = ms[1];
        } catch {}
        return { slug, title, name: f, source_doc };
      });
    res.json({ files });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/user-projects/:id/wiki-page/:slug — content of one wiki page
// Falls back to raw/narrative/**/<slug>.md if no wiki page exists yet.
app.get('/api/user-projects/:id/wiki-page/:slug', (req, res) => {
  try {
    const slug    = req.params.slug;
    const projDir = path.join(USER_PROJECTS_DIR, req.params.id);

    // 1. Try compiled wiki page
    const wikiPath = path.join(projDir, 'wiki', `${slug}.md`);
    if (fs.existsSync(wikiPath)) {
      let raw = fs.readFileSync(wikiPath, 'utf-8').replace(/^---\n[\s\S]*?\n---\n*/, '');
      return res.json({ slug, content: raw, source: 'wiki' });
    }

    // 2. Fall back to raw narrative (ingest output) — search subdirs
    const rawNarDir = path.join(projDir, 'raw', 'narrative');
    if (fs.existsSync(rawNarDir)) {
      for (const sub of fs.readdirSync(rawNarDir)) {
        const candidate = path.join(rawNarDir, sub, `${slug}.md`);
        if (fs.existsSync(candidate)) {
          let raw = fs.readFileSync(candidate, 'utf-8').replace(/^---\n[\s\S]*?\n---\n*/, '');
          return res.json({ slug, content: raw, source: 'raw' });
        }
      }
    }

    return res.status(404).json({ error: 'Page not found' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/user-projects/:id/graph — wiki graph for a specific project
app.get('/api/user-projects/:id/graph', (req, res) => {
  try {
    const projDir  = path.join(USER_PROJECTS_DIR, req.params.id);
    const wikiDir  = path.join(projDir, 'wiki');
    if (!fs.existsSync(wikiDir)) return res.json({ nodes: [], edges: [], meta: { total_nodes: 0, shown_nodes: 0, total_edges: 0, shown_edges: 0 } });

    const files = fs.readdirSync(wikiDir).filter(f => f.endsWith('.md') && f !== 'Index.md');
    const nodeMap  = new Map();
    const rawEdges = [];

    for (const file of files) {
      const slug = file.replace(/\.md$/, '');
      let raw;
      try { raw = fs.readFileSync(path.join(wikiDir, file), 'utf-8'); } catch { continue; }

      let meta = { slug, title: slug.replace(/_/g, ' '), discipline: -1, doc_type: '', source_folder: '', source_doc: '' };
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
      if (fmMatch) {
        for (const line of fmMatch[1].split('\n')) {
          const kv = line.match(/^(\w+):\s*"?(.+?)"?\s*$/);
          if (kv) {
            const [, k, v] = kv;
            if (k === 'title')              meta.title = v;
            else if (k === 'discipline')    meta.discipline = parseInt(v) || -1;
            else if (k === 'doc_type')      meta.doc_type = v;
            else if (k === 'source_folder') meta.source_folder = v;
            else if (k === 'source_doc')    meta.source_doc = v;
          }
        }
      }
      nodeMap.set(slug, meta);

      for (const m of raw.matchAll(/\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g)) {
        rawEdges.push({ source: slug, target: m[1].trim() });
      }
    }

    const limit = Math.min(parseInt(req.query.limit || '300'), 600);
    const edges  = rawEdges.filter(e => nodeMap.has(e.source) && nodeMap.has(e.target));

    const degree = new Map();
    for (const { source, target } of edges) {
      degree.set(source, (degree.get(source) || 0) + 1);
      degree.set(target, (degree.get(target) || 0) + 1);
    }

    let nodes = [...nodeMap.values()]
      .sort((a, b) => (degree.get(b.slug) || 0) - (degree.get(a.slug) || 0))
      .slice(0, limit)
      .map(n => ({ id: n.slug, title: n.title, discipline: n.discipline, doc_type: n.doc_type, source_folder: n.source_folder, source_doc: n.source_doc || '', degree: degree.get(n.slug) || 0 }));

    const nodeIds = new Set(nodes.map(n => n.id));
    const edgeSet = new Set();
    const finalEdges = edges.filter(e => {
      if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) return false;
      const key = [e.source, e.target].sort().join('→');
      if (edgeSet.has(key)) return false;
      edgeSet.add(key); return true;
    });

    res.json({ nodes, edges: finalEdges, meta: { total_nodes: nodeMap.size, shown_nodes: nodes.length, total_edges: edges.length, shown_edges: finalEdges.length } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user-projects/:id/query — run ask.py against project wiki
app.post('/api/user-projects/:id/query', (req, res) => {
  const { question } = req.body;
  if (!question?.trim()) return res.status(400).json({ error: 'question is required' });

  const projDir = path.join(USER_PROJECTS_DIR, req.params.id);
  if (!fs.existsSync(projDir)) return res.status(404).json({ error: 'Project not found' });

  const proc = spawn(PYTHON, [WIKI_ASK_GENERIC, '--json-stream', question.trim()], {
    cwd: path.join(RAG_ROOT, 'wiki_kb'),
    env: { ...process.env, WIKI_KB_ROOT: projDir },
  });

  let stdout = '';
  let stderr = '';
  proc.stdout.on('data', chunk => { stdout += chunk; });
  proc.stderr.on('data', chunk => { stderr += chunk; });

  proc.on('close', code => {
    if (code !== 0) {
      console.error('[user-project query stderr]', stderr.slice(-500));
      return res.status(500).json({ error: 'Query failed', detail: stderr.slice(-500) });
    }
    let answer = '';
    for (const line of stdout.split('\n')) {
      if (!line.trim()) continue;
      try {
        const evt = JSON.parse(line);
        if (evt.type === 'answer') { answer = evt.content; break; }
      } catch {}
    }
    res.json({ answer: answer || '[No answer generated]' });
  });

  proc.on('error', err =>
    res.status(500).json({ error: 'Failed to start Python', detail: err.message })
  );
});

// POST /api/user-projects/:id/files — add files to existing project
app.post('/api/user-projects/:id/files', upload.array('files'), (req, res) => {
  const id = req.params.id;
  const projDir = path.join(USER_PROJECTS_DIR, id);
  const sourceDir = path.join(projDir, 'source');
  if (!fs.existsSync(sourceDir)) return res.status(404).json({ error: 'Project not found' });

  let folderNames = [];
  try { folderNames = JSON.parse(req.body.folder_names || '[]'); } catch {}
  const added = (req.files || []).map((f, i) => {
    const dest = path.join(sourceDir, f.originalname);
    fs.renameSync(f.path, dest);
    return { name: f.originalname, size: f.size, folder: folderNames[i] || null };
  });

  // Update meta file list — add new files, update folder for existing ones
  const all = loadUserProjects();
  const proj = all.find(p => p.id === id);
  if (proj) {
    const existingMap = new Map((proj.files || []).map(f => [f.name, f]));
    added.forEach(f => {
      if (existingMap.has(f.name)) {
        if (f.folder !== null) existingMap.get(f.name).folder = f.folder;
      } else {
        proj.files.push(f);
        existingMap.set(f.name, f);
      }
    });
    saveUserProjects(all);
  }

  res.json({ files: proj?.files || added });
});

// PATCH /api/user-projects/:id/files/:filename — update file folder assignment
app.patch('/api/user-projects/:id/files/:filename', (req, res) => {
  const { id, filename } = req.params;
  const { folder } = req.body;
  const all = loadUserProjects();
  const proj = all.find(p => p.id === id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  const file = (proj.files || []).find(f => f.name === decodeURIComponent(filename));
  if (!file) return res.status(404).json({ error: 'File not found' });
  file.folder = folder || null;
  saveUserProjects(all);
  res.json({ file });
});

// POST /api/user-projects/:id/folders — create a named folder (persists empty folders)
app.post('/api/user-projects/:id/folders', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const all = loadUserProjects();
  const proj = all.find(p => p.id === id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  if (!proj.folders) proj.folders = [];
  const folderName = name.trim();
  if (!proj.folders.includes(folderName)) { proj.folders.push(folderName); saveUserProjects(all); }
  res.json({ folders: proj.folders });
});

// GET /api/user-projects/:id/source/:filename — serve raw file (PDF preview)
app.get('/api/user-projects/:id/source/:filename', (req, res) => {
  const filePath = path.join(USER_PROJECTS_DIR, req.params.id, 'source', decodeURIComponent(req.params.filename));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  res.sendFile(filePath);
});

// GET /api/user-projects/:id/preview/:filename — extract content for preview
app.get('/api/user-projects/:id/preview/:filename', (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  const filePath = path.join(USER_PROJECTS_DIR, req.params.id, 'source', filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return res.json({ type: 'pdf' });

  const script = `
import sys, json
f = ${JSON.stringify(filePath)}
ext = ${JSON.stringify(ext)}
try:
    if ext == '.docx':
        import docx
        doc = docx.Document(f)
        paras = [p.text for p in doc.paragraphs if p.text.strip()]
        print(json.dumps({'type': 'docx', 'paragraphs': paras[:300]}))
    elif ext == '.doc':
        print(json.dumps({'type': 'doc_legacy'}))
    elif ext == '.xlsx':
        import openpyxl
        wb = openpyxl.load_workbook(f, read_only=True, data_only=True)
        sheets = []
        for name in wb.sheetnames[:3]:
            ws = wb[name]
            rows = []
            for i, row in enumerate(ws.iter_rows(values_only=True)):
                if i >= 100: break
                rows.append([str(c) if c is not None else '' for c in row])
            if rows: sheets.append({'name': name, 'rows': rows})
        print(json.dumps({'type': 'xlsx', 'sheets': sheets}))
    elif ext == '.xls':
        import xlrd
        wb = xlrd.open_workbook(f)
        sheets = []
        for si in range(min(3, wb.nsheets)):
            ws = wb.sheet_by_index(si)
            rows = []
            for ri in range(min(100, ws.nrows)):
                rows.append([str(ws.cell_value(ri, ci)) for ci in range(ws.ncols)])
            if rows: sheets.append({'name': ws.name, 'rows': rows})
        print(json.dumps({'type': 'xlsx', 'sheets': sheets}))
    else:
        print(json.dumps({'type': 'unknown'}))
except Exception as e:
    print(json.dumps({'error': str(e)}))
`;
  const proc = spawn(PYTHON, ['-c', script]);
  let out = '';
  proc.stdout.on('data', d => { out += d; });
  proc.on('close', () => {
    try { res.json(JSON.parse(out.trim())); }
    catch { res.status(500).json({ error: 'Parse error', raw: out.slice(0, 200) }); }
  });
});

// DELETE /api/user-projects/:id/files/:filename — remove a file
app.delete('/api/user-projects/:id/files/:filename', (req, res) => {
  const { id, filename } = req.params;
  const filePath = path.join(USER_PROJECTS_DIR, id, 'source', filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  const all = loadUserProjects();
  const proj = all.find(p => p.id === id);
  if (proj) {
    proj.files = (proj.files || []).filter(f => f.name !== filename);
    saveUserProjects(all);
    return res.json({ files: proj.files });
  }
  res.json({ files: [] });
});

// POST /api/user-projects/:id/rebuild — re-run pipeline after file changes
app.post('/api/user-projects/:id/rebuild', (req, res) => {
  const id = req.params.id;
  const projDir = path.join(USER_PROJECTS_DIR, id);
  const sourceDir = path.join(projDir, 'source');
  if (!fs.existsSync(sourceDir)) return res.status(404).json({ error: 'Project not found' });

  // Clean old build artefacts but keep source/
  for (const sub of ['raw', 'wiki', 'db', '_tmp']) {
    const p = path.join(projDir, sub);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
    fs.mkdirSync(p, { recursive: true });
  }
  for (const f of ['corpus_map.json', 'manifest.json', 'compile_status.json']) {
    const p = path.join(projDir, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  // Update status
  fs.writeFileSync(path.join(projDir, 'status.json'), JSON.stringify({ status: 'processing', stage: 'starting' }));
  const all = loadUserProjects();
  const proj = all.find(p => p.id === id);
  if (proj) { proj.status = 'processing'; saveUserProjects(all); }

  // Spawn pipeline
  const logStream = fs.createWriteStream(path.join(projDir, 'pipeline.log'));
  const rebuildStderr = [];
  const proc = spawn(PYTHON, [
    ORCHESTRATOR, '--project-root', projDir, '--source', sourceDir, '--stage', 'all',
  ], { cwd: path.join(RAG_ROOT, 'wiki_kb') });

  proc.stdout.pipe(logStream);
  proc.stderr.on('data', chunk => { rebuildStderr.push(chunk.toString()); logStream.write(chunk); });

  proc.on('close', code => {
    logStream.end();
    const finalStatus = code === 0 ? 'ready' : 'failed';
    const statusObj = { status: finalStatus, exit_code: code };
    if (code !== 0) {
      const logPath = path.join(projDir, 'pipeline.log');
      try {
        const fullLog = fs.readFileSync(logPath, 'utf-8');
        statusObj.error = rebuildStderr.join('').slice(-2000) || fullLog.slice(-2000);
      } catch { statusObj.error = rebuildStderr.join('').slice(-2000); }
    }
    fs.writeFileSync(path.join(projDir, 'status.json'), JSON.stringify(statusObj, null, 2));
    const projects = loadUserProjects();
    const p = projects.find(x => x.id === id);
    if (p) { p.status = finalStatus; saveUserProjects(projects); }
  });

  res.json({ status: 'processing' });
});

// DELETE /api/user-projects/:id
app.delete('/api/user-projects/:id', (req, res) => {
  const id = req.params.id;
  const projDir = path.join(USER_PROJECTS_DIR, id);
  if (fs.existsSync(projDir)) fs.rmSync(projDir, { recursive: true, force: true });
  const all = loadUserProjects().filter(p => p.id !== id);
  saveUserProjects(all);
  res.json({ ok: true });
});

// Serve deliverable files (docx, md) for direct download
app.use('/files/pm-deliverables',           express.static(path.join(PM_DIR,      'deliverables')));
app.use('/files/process-deliverables',      express.static(path.join(PROCESS_DIR, 'deliverables')));
app.use('/files/mechanical-deliverables',   express.static(path.join(MECH_DIR,    'deliverables')));

// ---------------------------------------------------------------------------
// Multi-tenant App — /api/app/*
// ---------------------------------------------------------------------------

const APP_DB_PATH  = path.join(DATA_DIR, 'app_db.json');
const JWT_SECRET   = process.env.JWT_SECRET || 'dev_secret_change_in_prod';

function loadAppDb() {
  if (!fs.existsSync(APP_DB_PATH)) return { companies: [], users: [] };
  try { return JSON.parse(fs.readFileSync(APP_DB_PATH, 'utf-8')); } catch { return { companies: [], users: [] }; }
}
function saveAppDb(db) { fs.writeFileSync(APP_DB_PATH, JSON.stringify(db, null, 2)); }

function hashPassword(p) { return createHash('sha256').update(p + JWT_SECRET).digest('hex'); }

function requireAppAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.appUser = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// POST /api/app/auth/forgot-password
app.post('/api/app/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const db = loadAppDb();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.json({ ok: true }); // don't reveal if email exists
  const token = randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  if (!db.reset_tokens) db.reset_tokens = [];
  db.reset_tokens = db.reset_tokens.filter(t => t.user_id !== user.id);
  db.reset_tokens.push({ token, user_id: user.id, expires_at });
  saveAppDb(db);
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const origin = process.env.APP_URL || `${proto}://${req.get('host')}`;
  const resetUrl = `${origin}/reset-password?token=${token}`;
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import('resend');
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'noreply@trustedaiadvisory.ca',
        to: email,
        subject: 'Reset your password — Hunters.ai',
        html: `<p>Hi,</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
      });
    } else {
      console.log(`[forgot-password] DEV — reset link for ${email}: ${resetUrl}`);
    }
  } catch (err) { console.error('[forgot-password] email error:', err); }
  res.json({ ok: true });
});

// POST /api/app/auth/reset-password
app.post('/api/app/auth/reset-password', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Missing fields' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const db = loadAppDb();
  if (!db.reset_tokens) return res.status(400).json({ error: 'Invalid or expired token' });
  const entry = db.reset_tokens.find(t => t.token === token);
  if (!entry) return res.status(400).json({ error: 'Invalid or expired token' });
  if (new Date() > new Date(entry.expires_at)) {
    db.reset_tokens = db.reset_tokens.filter(t => t.token !== token);
    saveAppDb(db);
    return res.status(400).json({ error: 'Token expired' });
  }
  const user = db.users.find(u => u.id === entry.user_id);
  if (!user) return res.status(400).json({ error: 'User not found' });
  user.password_hash = hashPassword(password);
  db.reset_tokens = db.reset_tokens.filter(t => t.token !== token);
  saveAppDb(db);
  res.json({ ok: true });
});

// POST /api/app/auth/login
app.post('/api/app/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = loadAppDb();
  const user = db.users.find(u => u.email === email && u.password_hash === hashPassword(password));
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const company = db.companies.find(c => c.id === user.company_id);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, company_id: user.company_id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, company_id: user.company_id }, company });
});

// GET /api/app/auth/me
app.get('/api/app/auth/me', requireAppAuth, (req, res) => {
  const db = loadAppDb();
  const user = db.users.find(u => u.id === req.appUser.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const company = db.companies.find(c => c.id === user.company_id);
  res.json({ user: { id: user.id, email: user.email, role: user.role, company_id: user.company_id }, company });
});

// POST /api/app/setup — create company + admin user (open, for first-time onboarding UI)
app.post('/api/app/setup', (req, res) => {
  const { company_name, admin_email, admin_password } = req.body;
  if (!company_name || !admin_email || !admin_password) return res.status(400).json({ error: 'Missing fields' });
  const db = loadAppDb();
  if (db.users.find(u => u.email === admin_email)) return res.status(409).json({ error: 'Email already registered' });
  const company = { id: 'co_' + randomBytes(6).toString('hex'), name: company_name, slug: company_name.toLowerCase().replace(/\s+/g, '-') };
  const user = { id: 'usr_' + randomBytes(6).toString('hex'), email: admin_email, password_hash: hashPassword(admin_password), role: 'admin', company_id: company.id };
  db.companies.push(company); db.users.push(user);
  saveAppDb(db);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, company_id: company.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, company_id: company.id }, company });
});

// POST /api/app/admin/users — invite a user to a company
app.post('/api/app/admin/users', requireAppAuth, (req, res) => {
  if (req.appUser.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { email, password, role = 'viewer' } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const db = loadAppDb();
  if (db.users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already exists' });
  const user = { id: 'usr_' + randomBytes(6).toString('hex'), email, password_hash: hashPassword(password), role, company_id: req.appUser.company_id };
  db.users.push(user); saveAppDb(db);
  res.json({ user: { id: user.id, email: user.email, role } });
});

// GET /api/app/companies/:id/users
app.get('/api/app/companies/:id/users', requireAppAuth, (req, res) => {
  if (req.appUser.company_id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const db = loadAppDb();
  res.json(db.users.filter(u => u.company_id === req.params.id).map(u => ({ id: u.id, email: u.email, role: u.role })));
});

const APP_DIST = path.join(__dirname, '../app/dist');
const DIST     = path.join(__dirname, 'dist');

if (process.env.SERVE_NEW_APP === 'true') {
  // New multi-tenant app served at root (separate Railway deployment)
  if (fs.existsSync(APP_DIST)) {
    app.use(express.static(APP_DIST));
    app.get('*', (_req, res) => res.sendFile(path.join(APP_DIST, 'index.html')));
  }
} else {
  // Old demo app at root; new app optionally at /app
  if (fs.existsSync(APP_DIST)) {
    app.use('/app', express.static(APP_DIST));
    app.get('/app/*', (_req, res) => res.sendFile(path.join(APP_DIST, 'index.html')));
  }
  if (fs.existsSync(DIST)) {
    app.use(express.static(DIST));
    app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server → http://localhost:${PORT}`);
  console.log(`RAG root   → ${RAG_ROOT}`);
  console.log(`Python     → ${PYTHON}`);
});
