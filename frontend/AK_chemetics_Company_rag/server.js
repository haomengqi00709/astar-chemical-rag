import express from 'express';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RAG_ROOT   = path.resolve(__dirname, '..', '..');
const _localPython = path.join(RAG_ROOT, 'venv', 'bin', 'python3');
const PYTHON = (() => {
  const envPath = process.env.PYTHON_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;   // production (Docker/Railway)
  if (fs.existsSync(_localPython))       return _localPython; // local dev venv
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
const PROJECTS_STORE = path.join(PM_DIR, 'projects_store.json');

function loadProjects() {
  if (!fs.existsSync(PROJECTS_STORE)) return [];
  try {
    const arr = JSON.parse(fs.readFileSync(PROJECTS_STORE, 'utf-8'));
    // Backfill missing IDs for projects created before this feature
    let changed = false;
    for (const p of arr) {
      if (!p.id) { p.id = 'proj_' + randomBytes(4).toString('hex'); changed = true; }
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
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'PM agent failed' })}\n\n`);
      res.end();
      return;
    }
    try {
      const ctx = JSON.parse(stdout);
      const id = 'proj_' + randomBytes(4).toString('hex');
      upsertProject({ id, createdAt: new Date().toISOString(), status: 'active', context: ctx, docStatus: buildDocStatus(ctx.document_register), processOutput: null, mechanicalOutput: null });
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
// POST /api/agents/process
// Runs process_agent.py --json with SSE step progress.
// ---------------------------------------------------------------------------
app.post('/api/agents/process', (req, res) => {
  const { projectId } = req.body ?? {};
  let contextPath = path.join(PM_DIR, 'project_context.json');

  if (projectId) {
    const proj = loadProjects().find(p => p.id === projectId);
    if (!proj) return res.status(404).json({ error: 'Project not found' });
    const tmpCtx = path.join(os.tmpdir(), `ctx_${projectId}.json`);
    fs.writeFileSync(tmpCtx, JSON.stringify(proj.context, null, 2));
    contextPath = tmpCtx;
  }

  if (!fs.existsSync(contextPath)) {
    return res.status(400).json({ error: 'project_context.json not found — run PM agent first' });
  }

  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });

  const proc = spawn(PYTHON, [PROCESS_AGENT, '--json', '--context', contextPath], { cwd: RAG_ROOT });
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
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Process agent failed' })}\n\n`);
      res.end(); return;
    }
    try {
      const result = JSON.parse(stdout);
      fs.writeFileSync(path.join(PROCESS_DIR, 'process_output.json'), JSON.stringify(result, null, 2));
      fs.writeFileSync(path.join(PROCESS_DIR, 'process_calc_summary.md'), result.calc_summary || '');
      if (projectId) {
        const arr = loadProjects();
        const idx = arr.findIndex(p => p.id === projectId);
        if (idx >= 0) {
          arr[idx].processOutput = result;
          arr[idx].processSteps = {
            step1: { status: 'done', result: result.fluid_properties,  completedAt: new Date().toISOString() },
            step2: { status: 'done', result: result.design_criteria,   completedAt: new Date().toISOString() },
            step3: { status: 'done', result: result.hydraulic_results, completedAt: new Date().toISOString() },
            step4: { status: 'done', result: result.calc_summary,      completedAt: new Date().toISOString() },
          };
          if (!arr[idx].context) arr[idx].context = {};
          if (!arr[idx].context.deliverables) arr[idx].context.deliverables = {};
          // Write structured calc sheet for 1-CAL-XXXX
          const calcDocId = findCalcDocId(arr[idx].context?.document_register);
          arr[idx].context.deliverables[calcDocId] = JSON.stringify(
            buildCalcSheet(arr[idx].processSteps, arr[idx].context?.document_register), null, 2
          );
          // Store markdown content for other process deliverables (e.g. 1-PRC-0001)
          if (result.deliverables) {
            for (const [docId, content] of Object.entries(result.deliverables)) {
              if (!String(content).startsWith('[Generation failed')) {
                arr[idx].context.deliverables[docId] = content;
              }
            }
          }
          saveProjects(arr);
        }
      }
      res.write(`event: result\ndata: ${JSON.stringify(result)}\n\n`);
    } catch {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Could not parse process agent output', raw: stdout.slice(0, 300) })}\n\n`);
    }
    res.end();
  });

  proc.on('error', err => {
    res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  });
});


// ---------------------------------------------------------------------------
// POST /api/agents/process/step/:step
// Runs a single process calculation step.
// Body: { projectId }
// ---------------------------------------------------------------------------
app.post('/api/agents/process/step/:step', (req, res) => {
  const stepNum = parseInt(req.params.step, 10);
  if (![1, 2, 3, 4].includes(stepNum)) return res.status(400).json({ error: 'Step must be 1–4' });

  const { projectId } = req.body ?? {};
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });

  const arr = loadProjects();
  const proj = arr.find(p => p.id === projectId);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  const tmpCtx   = path.join(os.tmpdir(), `ctx_${projectId}.json`);
  const tmpPrior = path.join(os.tmpdir(), `prior_${projectId}.json`);
  fs.writeFileSync(tmpCtx,   JSON.stringify(proj.context, null, 2));
  fs.writeFileSync(tmpPrior, JSON.stringify(proj.processSteps ?? {}, null, 2));

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
        if (!arr[idx].processSteps) arr[idx].processSteps = {};
        arr[idx].processSteps[`step${stepNum}`] = {
          status: 'done', result: stepResult.result, completedAt: new Date().toISOString(),
        };
        // When step 4 completes, build the calc sheet deliverable
        const steps = arr[idx].processSteps;
        if (stepNum === 4 && steps.step1 && steps.step2 && steps.step3) {
          const calcDocId = findCalcDocId(arr[idx].context?.document_register);
          if (!arr[idx].context) arr[idx].context = {};
          if (!arr[idx].context.deliverables) arr[idx].context.deliverables = {};
          arr[idx].context.deliverables[calcDocId] = JSON.stringify(
            buildCalcSheet(steps, arr[idx].context?.document_register), null, 2
          );
        }
        saveProjects(arr);
      }
      res.json(stepResult);
    } catch {
      res.status(500).json({ error: 'Could not parse step output', raw: stdout.slice(0, 300) });
    }
  });

  proc.on('error', err => res.status(500).json({ error: err.message }));
});


// ---------------------------------------------------------------------------
// POST /api/agents/mechanical
// Runs mechanical_agent.py --json, saves output files, returns JSON.
// ---------------------------------------------------------------------------
app.post('/api/agents/mechanical', (req, res) => {
  const { projectId } = req.body ?? {};
  let contextPath = path.join(PROCESS_DIR, 'process_output.json');

  if (projectId) {
    const proj = loadProjects().find(p => p.id === projectId);
    if (!proj) return res.status(404).json({ error: 'Project not found' });
    if (!proj.processOutput) return res.status(400).json({ error: 'Run Process agent first for this project' });
    const tmpCtx = path.join(os.tmpdir(), `proc_${projectId}.json`);
    fs.writeFileSync(tmpCtx, JSON.stringify(proj.processOutput, null, 2));
    contextPath = tmpCtx;
  }

  if (!fs.existsSync(contextPath)) {
    return res.status(400).json({ error: 'process_output.json not found — run Process agent first' });
  }

  const proc = spawn(PYTHON, [MECH_AGENT, '--json', '--context', contextPath], { cwd: RAG_ROOT });
  let stdout = '', stderr = '';
  proc.stdout.on('data', chunk => { stdout += chunk; });
  proc.stderr.on('data', chunk => { stderr += chunk; });

  proc.on('close', code => {
    if (code !== 0) {
      console.error('[mech_agent stderr]', stderr.slice(-300));
      return res.status(500).json({ error: 'Mechanical agent failed', detail: stderr.slice(-500) });
    }
    try {
      const result = JSON.parse(stdout);
      fs.writeFileSync(path.join(MECH_DIR, 'mechanical_output.json'), JSON.stringify(result, null, 2));
      fs.writeFileSync(path.join(MECH_DIR, 'pump_datasheet.md'), result.pump_datasheet || '');
      const pumpCalcSheet  = buildPumpCalcSheet(result);
      let   pumpCalcDocId  = '4-CAL-0001';
      if (projectId) {
        const arr = loadProjects();
        const idx = arr.findIndex(p => p.id === projectId);
        if (idx >= 0) {
          pumpCalcDocId = findPumpCalcDocId(arr[idx].context?.document_register);
          arr[idx].mechanicalOutput = result;
          if (!arr[idx].context) arr[idx].context = {};
          if (!arr[idx].context.deliverables) arr[idx].context.deliverables = {};
          arr[idx].context.deliverables[pumpCalcDocId] = JSON.stringify(pumpCalcSheet, null, 2);
          // Store text deliverables (4-PDS-XXXX markdown) for in-app viewing
          if (result.deliverables) {
            for (const [docId, content] of Object.entries(result.deliverables)) {
              if (!String(content).startsWith('[Generation failed')) {
                arr[idx].context.deliverables[docId] = content;
              }
            }
          }
          saveProjects(arr);
        }
      }
      return res.json({ ...result, pumpCalcSheet, pumpCalcDocId });
    } catch {
      return res.status(500).json({ error: 'Could not parse mechanical agent output', raw: stdout.slice(0, 500) });
    }
  });

  proc.on('error', err => res.status(500).json({ error: 'Failed to start Python', detail: err.message }));
});


// ---------------------------------------------------------------------------
// GET /api/projects  — list all projects
// ---------------------------------------------------------------------------
app.get('/api/projects', (_req, res) => {
  res.json(loadProjects());
});


// ---------------------------------------------------------------------------
// POST /api/projects/:id/publish
// ---------------------------------------------------------------------------
app.post('/api/projects/:id/publish', (req, res) => {
  const arr = loadProjects();
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Project not found' });
  arr[idx].docStatus.__project = { status: 'published', publishedAt: new Date().toISOString(), publishedBy: req.body.userName ?? 'PM' };
  saveProjects(arr);
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

  const ds = arr[idx].docStatus;
  if (!ds[docId]) ds[docId] = { status: 'pending', comments: [], lastUpdated: new Date().toISOString(), updatedBy: null };

  const prev = ds[docId].status;
  ds[docId].status      = status;
  ds[docId].lastUpdated = new Date().toISOString();
  ds[docId].updatedBy   = userName ?? null;

  if (prev !== status) {
    ds[docId].comments.push({
      id: randomBytes(4).toString('hex'), type: 'system',
      text: `Status changed from "${prev.replace(/_/g, ' ')}" to "${status.replace(/_/g, ' ')}"`,
      author: userName ?? 'System', role: userRole ?? '', timestamp: new Date().toISOString(),
    });
  }

  saveProjects(arr);
  res.json(ds[docId]);
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

  const ds = arr[idx].docStatus;
  if (!ds[docId]) ds[docId] = { status: 'pending', comments: [], lastUpdated: new Date().toISOString(), updatedBy: null };

  ds[docId].comments.push({
    id: randomBytes(4).toString('hex'), type: 'comment',
    text: text.trim(), author: userName ?? 'Unknown', role: userRole ?? '', timestamp: new Date().toISOString(),
  });

  saveProjects(arr);
  res.json(ds[docId]);
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

  if (!arr[idx].context) arr[idx].context = {};
  if (!arr[idx].context.deliverables) arr[idx].context.deliverables = {};
  arr[idx].context.deliverables[docId] = content;

  saveProjects(arr);
  res.json({ success: true });
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


// Serve deliverable files (docx, md) for direct download
app.use('/files/pm-deliverables',           express.static(path.join(PM_DIR,      'deliverables')));
app.use('/files/process-deliverables',      express.static(path.join(PROCESS_DIR, 'deliverables')));
app.use('/files/mechanical-deliverables',   express.static(path.join(MECH_DIR,    'deliverables')));

// Serve the Vite production build for all non-API routes
const DIST = path.join(__dirname, 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server → http://localhost:${PORT}`);
  console.log(`RAG root   → ${RAG_ROOT}`);
  console.log(`Python     → ${PYTHON}`);
});
