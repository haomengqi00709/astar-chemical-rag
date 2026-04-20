import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Filter, PlayCircle, FileText, Table2, Settings, Package, Layers,
  ChevronDown, ChevronRight, Briefcase, FlaskConical, Wrench, ArrowLeft, X,
  BookOpen, Send, Loader2, MessageSquare, Plus, Upload, Trash2, FolderOpen, Network,
} from 'lucide-react';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ProjectGraph } from './ProjectGraph';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Doc {
  doc_id: string;
  doc_type: string;
  discipline: number;
  source_folder: string;
  revision: string;
  is_template: boolean;
}

interface Discipline {
  id: number;
  name: string;
  docs: Doc[];
}

interface LibraryData {
  disciplines: Discipline[];
  total_docs: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const ALL_DISCIPLINES = [
  { id: 0, name: 'Administration' },
  { id: 1, name: 'Process Technology' },
  { id: 2, name: 'Civil & Site Preparation' },
  { id: 3, name: 'Structural & Buildings' },
  { id: 4, name: 'Equipment' },
  { id: 5, name: 'Piping & Layout' },
  { id: 6, name: 'Insulation' },
  { id: 7, name: 'Coatings' },
  { id: 8, name: 'Instrumentation & Control' },
  { id: 9, name: 'Electrical' },
];

const DOC_TYPE_STYLE: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  PRC: { bg: 'bg-blue-50',    text: 'text-blue-700',    icon: FileText },
  LST: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Table2 },
  SPC: { bg: 'bg-amber-50',   text: 'text-amber-700',   icon: Settings },
  DST: { bg: 'bg-purple-50',  text: 'text-purple-700',  icon: Package },
  PKG: { bg: 'bg-indigo-50',  text: 'text-indigo-700',  icon: Layers },
};

function getDocTypeStyle(type: string) {
  return DOC_TYPE_STYLE[type] || { bg: 'bg-slate-50', text: 'text-slate-500', icon: FileText };
}

const FOLDER_COLOR: Record<string, string> = {
  Procedure:     'bg-blue-100 text-blue-600',
  List:          'bg-green-100 text-green-600',
  Datasheet:     'bg-purple-100 text-purple-600',
  Specification: 'bg-amber-100 text-amber-600',
};
function folderColor(f: string) { return FOLDER_COLOR[f] || 'bg-slate-100 text-slate-500'; }

const ROLE_GROUPS = [
  { key: 'PM',                  label: 'Project Manager',     color: 'text-blue-600',    border: 'border-blue-100',    bg: 'bg-blue-50/60',    dot: 'bg-blue-500',    icon: Briefcase },
  { key: 'Process Engineer',    label: 'Process Engineer',    color: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50/60', dot: 'bg-emerald-500', icon: FlaskConical },
  { key: 'Mechanical Engineer', label: 'Mechanical Engineer', color: 'text-orange-600',  border: 'border-orange-100',  bg: 'bg-orange-50/60',  dot: 'bg-orange-500',  icon: Wrench },
];

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  pending:      { label: 'Pending',     cls: 'bg-slate-100 text-slate-500' },
  in_progress:  { label: 'In Progress', cls: 'bg-blue-100 text-blue-600' },
  under_review: { label: 'Review',      cls: 'bg-amber-100 text-amber-600' },
  approved:     { label: 'Approved',    cls: 'bg-emerald-100 text-emerald-700' },
};

function isCalcSheet(content: string) {
  try { return JSON.parse(content)._type === 'calc_sheet'; } catch { return false; }
}

// ─── Inline document viewer ──────────────────────────────────────────────────

const DocViewer: React.FC<{ docId: string; doc: any; content: string; onClose: () => void }> = ({ docId, doc, content, onClose }) => {
  const calc = (() => { try { const p = JSON.parse(content); return p._type === 'calc_sheet' ? p : null; } catch { return null; } })();

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full bg-white border-l border-slate-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
        <div>
          <p className="text-sm font-bold text-slate-900 font-mono">{docId}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">{doc?.title ?? ''}</p>
          {calc && (
            <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-500 border border-slate-200">
              {calc._subtype === 'pump_calc' ? 'PUMP CALC' : 'CALC SHEET'}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors shrink-0 mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {calc ? (
          <CalcViewer data={calc} />
        ) : (
          <pre className="p-5 text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</pre>
        )}
      </div>
    </motion.div>
  );
};

// Minimal calc sheet renderer for the library viewer
const PROCESS_SECTION_LABELS: Record<string, string> = {
  fluid_properties: 'Fluid Properties',
  design_criteria:  'Design Criteria',
  hydraulic_results:'Hydraulic Results',
};
const PUMP_SECTION_LABELS: Record<string, string> = {
  inputs:     'INPUT',
  calculated: 'CALC',
  outputs:    'OUTPUT',
};

const CalcViewer: React.FC<{ data: any }> = ({ data }) => {
  const sections = data._subtype === 'pump_calc' ? PUMP_SECTION_LABELS : PROCESS_SECTION_LABELS;
  return (
    <div className="p-4 space-y-4">
      {Object.entries(sections).map(([key, title]) => {
        const sectionData = data[key];
        if (!sectionData || typeof sectionData !== 'object') return null;
        const rows = Object.entries(sectionData).filter(([, v]) => v != null);
        if (rows.length === 0) return null;
        return (
          <div key={key} className="bg-slate-50 rounded-xl overflow-hidden">
            <p className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100">{title}</p>
            <table className="w-full">
              <tbody>
                {rows.map(([field, val]) => (
                  <tr key={field} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-1.5 text-[11px] text-slate-400 font-mono w-48">{field}</td>
                    <td className="px-4 py-1.5 text-[11px] font-semibold text-slate-800">{String(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
      {(data.calc_summary || data.calculation_notes) && (
        <div className="bg-slate-50 rounded-xl overflow-hidden">
          <p className="px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100">Notes</p>
          <p className="px-4 py-3 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{data.calc_summary || data.calculation_notes}</p>
        </div>
      )}
      <p className="text-[10px] text-slate-300 font-mono text-center pb-2">
        Generated {data.generated_at ? new Date(data.generated_at).toLocaleString() : ''}
      </p>
    </div>
  );
};

// ─── Project reference view ───────────────────────────────────────────────

const ProjectRefView: React.FC<{ project: any }> = ({ project }) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [tab, setTab] = useState<'files' | 'graph'>('files');
  const ctx        = project.context ?? {};
  const register   = (ctx.document_register ?? []) as any[];
  const deliverables: Record<string, string> = ctx.deliverables ?? {};
  const docStatus: Record<string, any>       = project.docStatus ?? {};
  const ps         = ctx.project_summary;

  const savedDocs = register.filter((d: any) => !!deliverables[d.doc_id]);
  const selectedDoc = selectedDocId ? register.find((d: any) => d.doc_id === selectedDocId) : null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Project header + tabs */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-extrabold text-slate-900">{ps?.project_title ?? project.id}</p>
            <p className="text-xs text-slate-400 mt-0.5">{ps?.client} · {ps?.location}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Completed</span>
            <span className="text-[10px] font-mono text-slate-400">{savedDocs.length} file{savedDocs.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {/* Tab bar */}
        <div className="flex gap-1 mt-3">
          {(['files', 'graph'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); if (t === 'files') {} else setSelectedDocId(null); }}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                tab === t
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t === 'files' ? <FileText className="w-3.5 h-3.5" /> : <Network className="w-3.5 h-3.5" />}
              {t === 'files' ? 'Files' : 'Knowledge Graph'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'graph' ? (
        <div className="flex-1 overflow-hidden">
          <ProjectGraph
            register={register}
            deliverables={deliverables}
            docStatus={docStatus}
          />
        </div>
      ) : (
      <div className="flex flex-1 overflow-hidden">
      {/* File list */}
      <div className={`overflow-y-auto ${selectedDocId ? 'w-80 shrink-0 border-r border-slate-100' : 'flex-1'}`}>

        {savedDocs.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-400 italic">No generated files for this project.</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {ROLE_GROUPS.map(group => {
              const groupDocs = savedDocs.filter((d: any) => d.assigned_to === group.key);
              if (groupDocs.length === 0) return null;
              const Icon = group.icon;
              return (
                <div key={group.key} className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-3.5 h-3.5 ${group.color}`} />
                    <p className={`text-[10px] font-mono font-bold uppercase tracking-widest ${group.color}`}>{group.label}</p>
                    <span className="text-[10px] font-mono text-slate-300">{groupDocs.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {groupDocs.map((doc: any) => {
                      const st   = docStatus[doc.doc_id]?.status ?? 'pending';
                      const scfg = STATUS_CFG[st] ?? STATUS_CFG.pending;
                      const calc = isCalcSheet(deliverables[doc.doc_id]);
                      const active = selectedDocId === doc.doc_id;
                      return (
                        <button
                          key={doc.doc_id}
                          onClick={() => setSelectedDocId(active ? null : doc.doc_id)}
                          className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all ${
                            active
                              ? `${group.bg} ${group.border} ring-1 ring-offset-0 ring-current/20`
                              : `border-slate-100 hover:${group.bg} hover:${group.border}`
                          }`}
                        >
                          <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${active ? group.color : 'text-slate-400'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 font-mono truncate">{doc.doc_id}</p>
                            <p className="text-[11px] text-slate-500 truncate">{doc.title}</p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {calc && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-500 border border-slate-200">CALC</span>}
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${scfg.cls}`}>{scfg.label}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Doc viewer */}
      {selectedDocId && selectedDoc && (
        <div className="flex-1 overflow-hidden">
          <DocViewer
            docId={selectedDocId}
            doc={selectedDoc}
            content={deliverables[selectedDocId] ?? ''}
            onClose={() => setSelectedDocId(null)}
          />
        </div>
      )}
      </div>
      )}
    </div>
  );
};

// ─── Create Project view ─────────────────────────────────────────────────────

const CreateProjectView: React.FC<{ onCreated: (proj: any) => void; onCancel: () => void }> = ({ onCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fl: FileList | null) => {
    if (!fl) return;
    const valid = Array.from(fl).filter(f => /\.(doc|docx|pdf)$/i.test(f.name));
    setFiles(prev => [...prev, ...valid]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleCreate = async () => {
    if (!name.trim()) { setError('Project name is required'); return; }
    if (files.length === 0) { setError('Upload at least one file'); return; }
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      files.forEach(f => fd.append('files', f));
      const res = await fetch('/api/user-projects', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const proj = await res.json();
      onCreated(proj);
    } catch (e: any) { setError(e.message || 'Failed to create project'); }
    finally { setUploading(false); }
  };

  const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <header className="px-6 py-3 bg-white border-b border-outline-variant/10 flex items-center gap-3 shrink-0">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-medium transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span className="text-slate-200">/</span>
        <span className="text-xs font-semibold text-slate-700">New Project</span>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Create New Project</h2>
            <p className="text-sm text-slate-500">Upload .doc, .docx or .pdf files. The system will compile them into a searchable knowledge base you can query.</p>
          </div>

          {/* Project name */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Project Name</label>
            <input
              type="text"
              placeholder="e.g. Client XYZ Standards"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>

          {/* File drop zone */}
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Files</label>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">Drop files here or click to browse</p>
              <p className="text-xs text-slate-400 mt-1">.doc, .docx, .pdf accepted</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".doc,.docx,.pdf"
              multiple
              onChange={e => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-1.5">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-700 truncate">{f.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{formatSize(f.size)}</span>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={uploading}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {uploading ? 'Uploading & Starting Build…' : 'Create & Build'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Completed Project view (deliverables + optional wiki build) ─────────────

const CompletedProjectView: React.FC<{
  project: any;
  onBack: () => void;
  onWikiBuilt: () => void;
}> = ({ project, onBack, onWikiBuilt }) => {
  const [tab, setTab] = useState<'files' | 'graph'>('files');
  const [fullProj, setFullProj] = useState<any>(null);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(
    () => new Set(['PM', 'Process Engineer', 'Mechanical Engineer'])
  );
  const [wikiStatus, setWikiStatus] = useState<'idle' | 'building' | 'done' | 'error'>('idle');

  const ps        = project.context?.project_summary ?? {};
  const register: any[]  = project.context?.document_register ?? [];
  const delivKeys = new Set(Object.keys(project.context?.deliverables ?? {}));
  const docStatus = project.docStatus ?? {};

  useEffect(() => {
    fetch(`/api/projects/${project.id}`)
      .then(r => r.json())
      .then(d => setFullProj(d))
      .catch(() => {});
  }, [project.id]);

  const handleRunWiki = async () => {
    setWikiStatus('building');
    try {
      const r = await fetch(`/api/projects/${project.id}/build-reference`, { method: 'POST' });
      if (!r.ok) throw new Error('Failed');
      setWikiStatus('done');
      setTimeout(onWikiBuilt, 600);
    } catch { setWikiStatus('error'); }
  };

  const toggleRole = (role: string) =>
    setExpandedRoles(prev => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role); else next.add(role);
      return next;
    });

  const groups = ROLE_GROUPS
    .map(rg => ({ ...rg, docs: register.filter((d: any) => d.assigned_to === rg.key && delivKeys.has(d.doc_id)) }))
    .filter(g => g.docs.length > 0);

  const selectedContent = selectedDoc && fullProj?.context?.deliverables?.[selectedDoc.doc_id];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="px-6 py-3 bg-white border-b border-outline-variant/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-slate-200">/</span>
          <span className="text-xs font-semibold text-slate-700 truncate">{ps.project_title ?? project.id}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Completed</span>
        </div>
        {wikiStatus === 'idle' && (
          <button onClick={handleRunWiki}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition-colors">
            <Network className="w-3.5 h-3.5" /> Run Wiki
          </button>
        )}
        {wikiStatus === 'building' && (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-100 text-amber-600">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Building Wiki…
          </span>
        )}
        {wikiStatus === 'done' && (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-600">
            Wiki Ready
          </span>
        )}
        {wikiStatus === 'error' && (
          <button onClick={handleRunWiki}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
            Failed — Retry
          </button>
        )}
      </header>

      {/* Tab bar */}
      <div className="flex gap-1 px-6 py-2 border-b border-slate-100 shrink-0 bg-white">
        {(['files', 'graph'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              tab === t ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}>
            {t === 'files' ? <FileText className="w-3.5 h-3.5" /> : <Network className="w-3.5 h-3.5" />}
            {t === 'files' ? 'Files' : 'Knowledge Graph'}
          </button>
        ))}
      </div>

      {tab === 'graph' ? (
        <div className="flex-1 overflow-hidden">
          <ProjectGraph register={register} deliverables={project.context?.deliverables ?? {}} docStatus={docStatus} />
        </div>
      ) : (
        /* Files tab: deliverables grouped by agent role */
        <div className="flex flex-1 overflow-hidden">
          {/* Left: grouped doc list */}
          <div className={`overflow-y-auto shrink-0 border-r border-slate-100 ${selectedDoc ? 'w-72' : 'flex-1'}`}>
            {groups.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-400 italic text-center">No deliverables yet.</p>
            ) : (
              <div className="py-1">
                {groups.map(({ key, label, icon: Icon, docs }) => {
                  const expanded = expandedRoles.has(key);
                  return (
                    <div key={key}>
                      <button onClick={() => toggleRole(key)}
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border-b border-slate-100 transition-colors">
                        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-[11px] font-bold font-mono text-slate-700 truncate flex-1">{label}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">{docs.length}</span>
                      </button>
                      {expanded && docs.map((doc: any) => (
                        <button key={doc.doc_id} onClick={() => setSelectedDoc(doc)}
                          className={`w-full text-left flex items-center gap-2.5 pl-8 pr-4 py-2.5 border-b border-slate-50 transition-colors ${
                            selectedDoc?.doc_id === doc.doc_id ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'
                          }`}>
                          <BookOpen className={`w-3.5 h-3.5 shrink-0 ${selectedDoc?.doc_id === doc.doc_id ? 'text-white' : 'text-slate-300'}`} />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold font-mono truncate">{doc.doc_id}</p>
                            <p className="text-[10px] truncate opacity-70">{doc.title ?? ''}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: content viewer */}
          {selectedDoc && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
                <div>
                  <p className="text-sm font-bold font-mono text-slate-900">{selectedDoc.doc_id}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedDoc.title ?? ''}</p>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {!fullProj
                  ? <div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                  : selectedContent
                  ? <pre className="p-5 text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedContent}</pre>
                  : <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3">
                      <FileText className="w-10 h-10 text-slate-200" />
                      <p className="text-sm text-slate-400">Content not available for this document.</p>
                    </div>
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── User Project view (status + chatbot) ────────────────────────────────────

type ChatMessage = { role: 'user' | 'assistant' | 'error'; content: string };
const UserProjectView: React.FC<{
  project: any;
  onBack: () => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
  initialMessages?: ChatMessage[];
  onMessagesChange?: (msgs: ChatMessage[]) => void;
}> = ({ project, onBack, onDelete, onRefresh, initialMessages, onMessagesChange }) => {
  const [status, setStatus] = useState<any>({ status: project.status });
  const [files, setFiles] = useState<any[]>(project.files || []);
  const [tab, setTab] = useState<'chat' | 'files' | 'graph'>('chat');
  // Files tab state
  const [selectedFile,  setSelectedFile]  = useState<{ slug: string; name: string; title: string } | null>(null);
  const [fileContent,   setFileContent]   = useState<string>('');
  const [fileLoading,   setFileLoading]   = useState(false);
  const [wikiFiles,     setWikiFiles]     = useState<{ slug: string; name: string; title: string; source_doc?: string }[]>([]);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    () => new Set((project.files || []).map((f: any) => f.name))
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => initialMessages ?? []);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dirty, setDirty] = useState(false);   // files changed since last build
  const [rebuilding, setRebuilding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const thinkingTimer = useRef<ReturnType<typeof setInterval>>();
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReady = status.status === 'ready';
  const isProcessing = status.status === 'processing';

  useEffect(() => {
    if (isProcessing) {
      const poll = () => {
        fetch(`/api/user-projects/${project.id}/status`).then(r => r.json()).then(s => {
          setStatus(s);
          if (s.status !== 'processing') {
            clearInterval(pollRef.current);
            setRebuilding(false);
            setDirty(false);
            onRefresh();
          }
        }).catch(() => {});
      };
      poll();
      pollRef.current = setInterval(poll, 5000);
      return () => clearInterval(pollRef.current);
    }
  }, [project.id, isProcessing]);

  // Sync messages back to parent cache whenever they change
  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading, thinkingStep]);

  // Load wiki file list when Files tab is first opened
  useEffect(() => {
    if (tab !== 'files' || wikiFiles.length > 0) return;
    fetch(`/api/user-projects/${project.id}/wiki-files`)
      .then(r => r.json())
      .then(d => setWikiFiles(d.files ?? []))
      .catch(() => {});
  }, [tab, project.id, wikiFiles.length]);

  const loadFileContent = async (file: { slug: string; name: string; title: string }) => {
    setSelectedFile(file);
    setFileContent('');
    setFileLoading(true);
    try {
      const r = await fetch(`/api/user-projects/${project.id}/wiki-page/${encodeURIComponent(file.slug)}`);
      if (!r.ok) { setFileContent(''); return; }   // 404 → show placeholder, not error text
      const d = await r.json();
      setFileContent(d.content ?? '');
    } catch { setFileContent(''); }                 // network error → same placeholder
    finally { setFileLoading(false); }
  };

  const THINKING = ['Reading wiki index…', 'Searching pages…', 'Analyzing content…', 'Synthesizing answer…'];

  const handleChat = async () => {
    const q = chatInput.trim();
    if (!q || chatLoading) return;
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setChatInput('');
    setChatLoading(true);
    let idx = 0;
    setThinkingStep(THINKING[0]);
    thinkingTimer.current = setInterval(() => { idx = Math.min(idx + 1, THINKING.length - 1); setThinkingStep(THINKING[idx]); }, 4000);

    try {
      const res = await fetch(`/api/user-projects/${project.id}/query`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Query failed');
      setMessages(prev => [...prev, { role: 'assistant', content: d.answer }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'error', content: e.message || 'Query failed' }]);
    } finally {
      clearInterval(thinkingTimer.current);
      setThinkingStep('');
      setChatLoading(false);
    }
  };

  const handleAddFiles = async (fl: FileList | null) => {
    if (!fl || fl.length === 0) return;
    const valid = Array.from(fl).filter(f => /\.(doc|docx|pdf)$/i.test(f.name));
    if (valid.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      valid.forEach(f => fd.append('files', f));
      const res = await fetch(`/api/user-projects/${project.id}/files`, { method: 'POST', body: fd });
      const d = await res.json();
      setFiles(d.files || []);
      setDirty(true);
      onRefresh();
    } catch {}
    finally { setUploading(false); }
  };

  const handleRemoveFile = async (filename: string) => {
    try {
      const res = await fetch(`/api/user-projects/${project.id}/files/${encodeURIComponent(filename)}`, { method: 'DELETE' });
      const d = await res.json();
      setFiles(d.files || []);
      setDirty(true);
      onRefresh();
    } catch {}
  };

  const handleRebuild = async () => {
    if (files.length === 0) return;
    setRebuilding(true);
    try {
      await fetch(`/api/user-projects/${project.id}/rebuild`, { method: 'POST' });
      setStatus({ status: 'processing', stage: 'starting' });
      setMessages([]);
    } catch { setRebuilding(false); }
  };

  const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  // ── File management panel (shown as a collapsible section) ──
  const FilePanel = () => (
    <div className="border-b border-slate-100 shrink-0">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-700">Source Files</p>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{files.length}</span>
          </div>
          <div className="flex items-center gap-2">
            {dirty && !isProcessing && (
              <button
                onClick={handleRebuild}
                disabled={rebuilding || files.length === 0}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {rebuilding ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlayCircle className="w-3 h-3" />}
                Rebuild
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isProcessing}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-[11px] flex items-center gap-1.5 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              Add Files
            </button>
            <input ref={fileInputRef} type="file" accept=".doc,.docx,.pdf" multiple onChange={e => handleAddFiles(e.target.files)} className="hidden" />
          </div>
        </div>
        <div className="space-y-1">
          {files.map((f: any, i: number) => (
            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 group">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-700 truncate">{f.name}</span>
                {f.size && <span className="text-[10px] text-slate-400 font-mono shrink-0">{formatSize(f.size)}</span>}
              </div>
              {!isProcessing && (
                <button onClick={() => handleRemoveFile(f.name)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {files.length === 0 && (
            <p className="text-[11px] text-slate-400 italic py-2">No files. Add files and rebuild to create the knowledge base.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <header className="px-6 py-3 bg-white border-b border-outline-variant/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span className="text-slate-200">/</span>
          <span className="text-xs font-semibold text-slate-700 truncate">{project.name}</span>
          {isReady && !dirty && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Ready</span>}
          {isReady && dirty && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">Files Changed</span>}
          {isProcessing && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 animate-spin" /> Building</span>}
          {status.status === 'failed' && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Failed</span>}
        </div>
        <button onClick={() => onDelete(project.id)} className="text-slate-300 hover:text-red-500 transition-colors" title="Delete project">
          <Trash2 className="w-4 h-4" />
        </button>
      </header>

      {isProcessing && (
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 shrink-0">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
            <p className="text-sm font-medium text-amber-800">Building knowledge base…</p>
          </div>
          <p className="text-xs text-amber-600 mt-1">Your files are being processed. This may take several minutes depending on file size.</p>
        </div>
      )}

      {status.status === 'failed' && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-100 shrink-0">
          <p className="text-sm font-medium text-red-800">Build failed</p>
          <p className="text-xs text-red-600 mt-1">Check files and try rebuilding, or delete and recreate the project.</p>
          {status.error && (
            <pre className="mt-2 text-[10px] font-mono text-red-700 bg-red-100 rounded p-2 max-h-40 overflow-auto whitespace-pre-wrap">{status.error}</pre>
          )}
          <button
            onClick={async () => {
              try {
                const r = await fetch(`/api/user-projects/${project.id}/log`);
                const d = await r.json();
                if (d.log) { setMessages(prev => [...prev, { role: 'error', content: '--- Pipeline Log ---\n' + d.log }]); }
              } catch {}
            }}
            className="mt-2 text-[10px] font-semibold text-red-700 hover:text-red-900 underline"
          >
            View Full Log
          </button>
        </div>
      )}

      {/* File panel — always visible */}
      <FilePanel />

      {/* Tab bar */}
      {files.length > 0 && (
        <div className="flex gap-1 px-6 py-2 border-b border-slate-100 shrink-0 bg-white">
          {(['chat', 'files', 'graph'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                tab === t ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t === 'chat' ? <MessageSquare className="w-3.5 h-3.5" /> : t === 'files' ? <FileText className="w-3.5 h-3.5" /> : <Network className="w-3.5 h-3.5" />}
              {t === 'chat' ? 'Chat' : t === 'files' ? 'Files' : 'Knowledge Graph'}
            </button>
          ))}
        </div>
      )}

      {tab === 'graph' && files.length > 0 ? (
        <div className="flex-1 overflow-hidden">
          <KnowledgeGraph graphUrl={`/api/user-projects/${project.id}/graph`} />
        </div>
      ) : tab === 'files' && files.length > 0 ? (
        /* ── Files tab: left list + right viewer ─────────────────────────── */
        <div className="flex flex-1 overflow-hidden">
          {/* Left: hierarchical file list — source files with nested wiki pages */}
          {(() => {
            const stripExt = (s: string) => s.replace(/\.[^.]+$/, '');
            const norm = (s: string) => s.toLowerCase().replace(/[\s\-_]+/g, ' ').trim();

            // Group wiki pages under their source file
            // Match by source_doc if present, fall back to slug (handles projects
            // where wiki pages were copied directly and have no source_doc in frontmatter)
            const groups = files.map((sf: any) => ({
              sf,
              sfNorm: norm(stripExt(sf.name)),
              pages: [] as { slug: string; name: string; title: string; source_doc?: string }[],
            }));
            const assigned = new Set<string>();
            for (const grp of groups) {
              grp.pages = wikiFiles.filter(w =>
                w.source_doc
                  ? norm(w.source_doc) === grp.sfNorm
                  : norm(w.slug) === grp.sfNorm
              );
              grp.pages.forEach(p => assigned.add(p.slug));
            }
            // Truly unassigned wiki pages → append to last group (fallback)
            const unassigned = wikiFiles.filter(w => !assigned.has(w.slug));
            if (groups.length > 0) groups[groups.length - 1].pages.push(...unassigned);

            const toggleSource = (name: string) =>
              setExpandedSources(prev => {
                const next = new Set(prev);
                if (next.has(name)) next.delete(name); else next.add(name);
                return next;
              });

            return (
              <div className={`overflow-y-auto shrink-0 border-r border-slate-100 ${selectedFile ? 'w-72' : 'flex-1'}`}>
                {groups.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-slate-400 italic text-center">No files found.</p>
                ) : (
                  <div className="py-1">
                    {groups.map(({ sf, pages }) => {
                      const expanded = expandedSources.has(sf.name);
                      return (
                        <div key={sf.name}>
                          {/* Source file row */}
                          <button
                            onClick={() => toggleSource(sf.name)}
                            className="w-full text-left flex items-center gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border-b border-slate-100 transition-colors"
                          >
                            {expanded
                              ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                            <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="text-[11px] font-bold font-mono text-slate-700 truncate flex-1">{sf.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-1">{pages.length}</span>
                          </button>
                          {/* Nested wiki pages */}
                          {expanded && pages.map(w => (
                            <button
                              key={w.slug}
                              onClick={() => loadFileContent(w)}
                              className={`w-full text-left flex items-center gap-2.5 pl-8 pr-4 py-2.5 border-b border-slate-50 transition-colors ${
                                selectedFile?.slug === w.slug
                                  ? 'bg-slate-900 text-white'
                                  : 'hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <BookOpen className={`w-3.5 h-3.5 shrink-0 ${selectedFile?.slug === w.slug ? 'text-white' : 'text-slate-300'}`} />
                              <span className="text-xs truncate">{w.title}</span>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
          {/* Right: content viewer */}
          {selectedFile && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
                <div>
                  <p className="text-sm font-bold font-mono text-slate-900">{selectedFile.name}</p>
                  {selectedFile.title !== selectedFile.name && (
                    <p className="text-xs text-slate-400 mt-0.5">{selectedFile.title}</p>
                  )}
                </div>
                <button onClick={() => { setSelectedFile(null); setFileContent(''); }} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {fileLoading
                  ? <div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
                  : fileContent
                  ? <pre className="p-5 text-xs font-mono text-slate-700 leading-relaxed whitespace-pre-wrap">{fileContent}</pre>
                  : <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3">
                      <FileText className="w-10 h-10 text-slate-200" />
                      <p className="text-sm text-slate-400">This file has been processed into the knowledge base.</p>
                      <p className="text-xs text-slate-300">Use the Chat tab to query its contents.</p>
                    </div>
                }
              </div>
            </div>
          )}
        </div>
      ) : !isReady || isProcessing ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
            {isProcessing ? <Loader2 className="w-8 h-8 text-amber-500 animate-spin" /> : <FolderOpen className="w-8 h-8 text-slate-400" />}
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">{isProcessing ? 'Building…' : project.name}</h2>
          <p className="text-sm text-slate-500 max-w-md">
            {isProcessing ? 'Processing your files into a searchable knowledge base.' : 'Add files above and click Rebuild to create the knowledge base.'}
          </p>
        </div>
      ) : (
        <>
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
                  <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 mb-2">Ask a Question</h2>
                <p className="text-sm text-slate-500 max-w-md">Knowledge base is ready. Ask questions about the documents in this project.</p>
              </div>
            ) : (
              <div className="px-6 py-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user' ? 'bg-slate-900 text-white'
                        : msg.role === 'error' ? 'bg-red-50 border border-red-100 text-red-600'
                        : 'bg-slate-50 border border-slate-100 text-slate-700'
                    }`}>
                      <div className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? '' : 'font-mono text-[13px]'}`}>{msg.content}</div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 max-w-[75%]">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span className="font-medium">{thinkingStep || 'Agent is working…'}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Chat input */}
          <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about this project's documents…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()}
                disabled={chatLoading}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleChat}
                disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Library component ──────────────────────────────────────────────────

export const Library: React.FC<{ defaultUserProjectId?: string; isAdmin?: boolean; companyName?: string }> = ({ defaultUserProjectId, isAdmin = false, companyName }) => {
  const [data,              setData]              = useState<LibraryData | null>(null);
  const [loading,           setLoading]           = useState(true);
  const [selectedDisc,      setSelectedDisc]      = useState<number | 'all'>('all');
  const [search,            setSearch]            = useState('');

  // sidebar section open states
  const [standardOpen,      setStandardOpen]      = useState(true);
  const [docsOpen,          setDocsOpen]          = useState(false);
  const [refProjectsOpen,   setRefProjectsOpen]   = useState(true);
  const [myProjectsOpen,    setMyProjectsOpen]    = useState(true);

  // view mode: 'query' (chatbot) | 'docs' (document grid) | 'graph' (knowledge graph)
  const [activeView,        setActiveView]        = useState<'query' | 'docs' | 'graph'>('query');

  // chatbot state
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant' | 'error'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const thinkingTimer = useRef<ReturnType<typeof setInterval>>();

  // reference projects
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [selectedProject,   setSelectedProject]   = useState<any | null>(null);

  // user projects (custom RAG)
  const [userProjects,        setUserProjects]        = useState<any[]>([]);
  const [selectedUserProject, setSelectedUserProject] = useState<any | null>(null);
  const [creatingProject,     setCreatingProject]     = useState(false);

  // Persistent chat history cache: projectId → messages[]
  const chatHistoryCache = useRef<Map<string, { role: 'user' | 'assistant' | 'error'; content: string }[]>>(new Map());

  // Admin: standard upload state
  const [uploadingStandard,   setUploadingStandard]   = useState(false);
  const [standardProject,     setStandardProject]     = useState<any | null>(null);
  const stdFileRef = useRef<HTMLInputElement>(null);

  const refreshUserProjects = useCallback(() => {
    if (isAdmin) return; // admin mode: only track projects created this session
    fetch('/api/user-projects').then(r => r.json()).then(projects => {
      setUserProjects(projects);
      if (defaultUserProjectId && !selectedUserProject) {
        const found = projects.find((p: any) => p.id === defaultUserProjectId);
        if (found) setSelectedUserProject(found);
      }
    }).catch(() => {});
  }, [defaultUserProjectId, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }
    fetch('/api/library')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/projects')
      .then(r => r.json())
      .then((ps: any[]) => setCompletedProjects(ps.filter(p => p.status === 'completed')))
      .catch(() => {});

    refreshUserProjects();
  }, [refreshUserProjects, isAdmin]);

  // Admin: upload files to company standard
  const handleUploadStandard = async (fl: FileList | null) => {
    if (!fl || fl.length === 0) return;
    setUploadingStandard(true);
    try {
      const fd = new FormData();
      fd.append('name', `__standard__${companyName || ''}`);
      Array.from(fl).forEach(f => fd.append('files', f));
      if (standardProject) {
        // Add to existing standard project
        const res = await fetch(`/api/user-projects/${standardProject.id}/files`, { method: 'POST', body: fd });
        const d = await res.json();
        setStandardProject((p: any) => ({ ...p, files: d.files }));
        await fetch(`/api/user-projects/${standardProject.id}/rebuild`, { method: 'POST' });
      } else {
        // Create new standard project
        const res = await fetch('/api/user-projects', { method: 'POST', body: fd });
        const d = await res.json();
        setStandardProject(d);
        setSelectedUserProject(d);
      }
      refreshUserProjects();
    } catch {}
    finally { setUploadingStandard(false); }
  };

  // Standard library view
  const allDocs: Doc[] = data
    ? (selectedDisc === 'all'
        ? data.disciplines.flatMap(d => d.docs)
        : data.disciplines.find(d => d.id === selectedDisc)?.docs ?? [])
    : [];

  const filtered = search.trim()
    ? allDocs.filter(d =>
        d.doc_id.toLowerCase().includes(search.toLowerCase()) ||
        d.doc_type.toLowerCase().includes(search.toLowerCase()) ||
        d.source_folder.toLowerCase().includes(search.toLowerCase())
      )
    : allDocs;

  const discCount: Record<number, number> = {};
  data?.disciplines.forEach(d => { discCount[d.id] = d.docs.length; });
  const presentIds = new Set(data?.disciplines.map(d => d.id) ?? []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading, thinkingStep]);

  const THINKING_STEPS = [
    'Reading wiki index…',
    'Searching for relevant pages…',
    'Reading wiki pages…',
    'Following links…',
    'Analyzing content…',
    'Synthesizing answer…',
  ];

  const startThinking = () => {
    let idx = 0;
    setThinkingStep(THINKING_STEPS[0]);
    thinkingTimer.current = setInterval(() => {
      idx = Math.min(idx + 1, THINKING_STEPS.length - 1);
      setThinkingStep(THINKING_STEPS[idx]);
    }, 4000);
  };

  const stopThinking = () => {
    clearInterval(thinkingTimer.current);
    setThinkingStep('');
  };

  const handleChat = async () => {
    const q = chatInput.trim();
    if (!q || chatLoading) return;
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setChatInput('');
    setChatLoading(true);
    startThinking();

    try {
      const res = await fetch('/api/wiki/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Query failed');
      setMessages(prev => [...prev, { role: 'assistant', content: d.answer }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'error', content: e.message || 'Query failed' }]);
    } finally {
      stopThinking();
      setChatLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex h-full bg-surface-container-low overflow-hidden"
    >
      {/* ── Left sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-white border-r border-outline-variant/10 flex flex-col overflow-y-auto">

        {/* ── Standard section ── */}
        <div>
          <button
            onClick={() => setStandardOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 hover:bg-slate-50 transition-colors"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Standard</p>
            {standardOpen
              ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>
          {/* Admin: upload files to standard */}
          {isAdmin && standardOpen && (
            <div className="px-5 py-3 border-b border-outline-variant/10">
              {!standardProject ? (
                <button
                  onClick={() => stdFileRef.current?.click()}
                  disabled={uploadingStandard}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs font-medium hover:border-primary-container hover:text-primary-container transition-colors disabled:opacity-50"
                >
                  {uploadingStandard ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  Upload Company Standards
                </button>
              ) : (
                <button
                  onClick={() => stdFileRef.current?.click()}
                  disabled={uploadingStandard}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  {uploadingStandard ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Add More Files
                </button>
              )}
              <input ref={stdFileRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={e => handleUploadStandard(e.target.files)} />
            </div>
          )}

          {standardOpen && (
            <nav className="py-1">
              {/* Admin: show Files nav when standard project exists */}
              {isAdmin && standardProject && (
                <button
                  onClick={() => { setSelectedUserProject(standardProject); setSelectedProject(null); setCreatingProject(false); }}
                  className={`w-full flex items-center gap-2 px-5 py-2.5 text-sm transition-colors ${
                    selectedUserProject?.id === standardProject.id
                      ? 'bg-primary-container/10 text-primary-container font-bold border-r-2 border-primary-container'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-xs">All Documents</span>
                  <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                    {standardProject.files?.length ?? 0}
                  </span>
                </button>
              )}

              {/* Query — hidden in admin mode until standard is built */}
              {!isAdmin && (
              <button
                onClick={() => { setActiveView('query'); setSelectedProject(null); setSelectedUserProject(null); setCreatingProject(false); }}
                className={`w-full flex items-center gap-2 px-5 py-2.5 text-sm transition-colors ${
                  !selectedProject && !selectedUserProject && !creatingProject && activeView === 'query'
                    ? 'bg-primary-container/10 text-primary-container font-bold border-r-2 border-primary-container'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-xs">Query</span>
              </button>
              )}

              {/* Knowledge Graph — hidden in admin mode until standard is built */}
              {!isAdmin && (
              <button
                onClick={() => { setActiveView('graph'); setSelectedProject(null); setSelectedUserProject(null); setCreatingProject(false); }}
                className={`w-full flex items-center gap-2 px-5 py-2.5 text-sm transition-colors ${
                  !selectedProject && !selectedUserProject && !creatingProject && activeView === 'graph'
                    ? 'bg-primary-container/10 text-primary-container font-bold border-r-2 border-primary-container'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span className="text-xs">Knowledge Graph</span>
              </button>
              )}

              {/* All Documents dropdown — hidden in admin mode */}
              {!isAdmin && (
                <>
                  <button
                    onClick={() => { setDocsOpen(o => !o); setActiveView('docs'); setSelectedProject(null); setSelectedUserProject(null); setCreatingProject(false); }}
                    className={`w-full flex items-center justify-between px-5 py-2.5 text-sm transition-colors ${
                      !selectedProject && !selectedUserProject && !creatingProject && activeView === 'docs'
                        ? 'bg-primary-container/10 text-primary-container font-bold border-r-2 border-primary-container'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-xs">All Documents</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {data && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                          {data.total_docs}
                        </span>
                      )}
                      {docsOpen
                        ? <ChevronDown className="w-3 h-3 text-slate-400" />
                        : <ChevronRight className="w-3 h-3 text-slate-400" />}
                    </div>
                  </button>
                  {docsOpen && (
                    <div className="ml-4 border-l-2 border-slate-100">
                      <button
                        onClick={() => { setSelectedDisc('all'); setActiveView('docs'); setSelectedProject(null); setSelectedUserProject(null); setCreatingProject(false); }}
                        className={`w-full flex items-center justify-between pl-4 pr-5 py-2 text-sm transition-colors ${
                          activeView === 'docs' && !selectedProject && selectedDisc === 'all'
                            ? 'text-primary-container font-bold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs">All</span>
                      </button>
                      {ALL_DISCIPLINES.map(disc => {
                        const hasData = presentIds.has(disc.id);
                        const count   = discCount[disc.id] ?? 0;
                        const active  = activeView === 'docs' && !selectedProject && selectedDisc === disc.id;
                        return (
                          <button
                            key={disc.id}
                            onClick={() => { if (hasData) { setSelectedDisc(disc.id); setActiveView('docs'); setSelectedProject(null); setSelectedUserProject(null); setCreatingProject(false); } }}
                            className={`w-full flex items-center justify-between pl-4 pr-5 py-1.5 text-sm transition-colors ${
                              !hasData ? 'text-slate-300 cursor-default'
                              : active ? 'text-primary-container font-bold'
                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-[10px] font-mono font-bold shrink-0 ${active ? 'text-primary-container' : hasData ? 'text-slate-400' : 'text-slate-200'}`}>
                                {disc.id}
                              </span>
                              <span className="truncate text-xs">{disc.name}</span>
                            </div>
                            {hasData
                              ? <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ml-1 ${active ? 'bg-primary-container/10 text-primary-container' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
                              : <span className="text-[10px] text-slate-200 shrink-0 ml-1">—</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </nav>
          )}
        </div>

        {/* ── Reference Projects section — agent-completed projects only ── */}
        <div className="border-t border-outline-variant/10">
          <button
            onClick={() => setRefProjectsOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Reference Projects</p>
              {completedProjects.length > 0 && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{completedProjects.length} project{completedProjects.length !== 1 ? 's' : ''}</p>
              )}
            </div>
            {refProjectsOpen
              ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          </button>

          {refProjectsOpen && (
            <nav className="py-2 border-t border-outline-variant/10">
              {completedProjects.map(proj => {
                const ps       = proj.context?.project_summary;
                const active   = selectedProject?.id === proj.id;
                const docCount = (proj.context?.document_register ?? []).length;
                return (
                  <button
                    key={proj.id}
                    onClick={() => { setSelectedProject(active ? null : proj); setSelectedUserProject(null); setCreatingProject(false); }}
                    className={`w-full text-left px-5 py-2 transition-colors ${
                      active
                        ? 'bg-primary-container/10 text-primary-container font-bold border-r-2 border-primary-container'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                      <p className="text-[11px] truncate leading-snug font-medium">{ps?.project_title ?? proj.id}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 ml-5.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Completed</span>
                      <span className="text-[10px] font-mono text-slate-400">{docCount} doc{docCount !== 1 ? 's' : ''}</span>
                    </div>
                  </button>
                );
              })}
              {completedProjects.length === 0 && (
                <p className="pl-8 pr-4 py-2 text-[11px] text-slate-300 italic">No reference projects yet.</p>
              )}
            </nav>
          )}
        </div>

        {/* ── My Projects section — only visible in new-kb-app mode (isAdmin) ── */}
        {isAdmin && <div className="border-t border-outline-variant/10">
          <button
            onClick={() => setMyProjectsOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">My Projects</p>
              {userProjects.filter(p => !p.isFromProject).length > 0 && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{userProjects.filter(p => !p.isFromProject).length} project{userProjects.filter(p => !p.isFromProject).length !== 1 ? 's' : ''}</p>
              )}
            </div>
            {myProjectsOpen
              ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          </button>

          {myProjectsOpen && (
            <nav className="py-2 border-t border-outline-variant/10">
              {/* + New Project */}
              <button
                onClick={() => { setCreatingProject(true); setSelectedProject(null); setSelectedUserProject(null); }}
                className={`w-full flex items-center gap-2 px-5 py-2 text-xs transition-colors ${
                  creatingProject
                    ? 'bg-primary-container/10 text-primary-container font-bold border-r-2 border-primary-container'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>

              {userProjects.filter(p => !p.isFromProject).map(proj => {
                const active  = selectedUserProject?.id === proj.id;
                const isReady = proj.status === 'ready';
                return (
                  <button
                    key={proj.id}
                    onClick={() => { setSelectedUserProject(active ? null : proj); setSelectedProject(null); setCreatingProject(false); }}
                    className={`w-full text-left px-5 py-2 transition-colors ${
                      active
                        ? 'bg-primary-container/10 text-primary-container font-bold border-r-2 border-primary-container'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                      <p className="text-[11px] truncate leading-snug font-medium">{proj.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 ml-5.5">
                      {isReady ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Ready</span>
                      ) : proj.status === 'processing' ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 flex items-center gap-1">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" /> Building
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Failed</span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">{proj.files?.length ?? 0} file{(proj.files?.length ?? 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          )}
        </div>}

      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {creatingProject ? (
          <CreateProjectView
            onCancel={() => setCreatingProject(false)}
            onCreated={(proj) => {
              setCreatingProject(false);
              setSelectedUserProject(proj);
              if (isAdmin) {
                setUserProjects(prev => [...prev, proj]);
              } else {
                refreshUserProjects();
              }
            }}
          />
        ) : selectedUserProject ? (
          <UserProjectView
            key={selectedUserProject.id}
            project={selectedUserProject}
            onBack={() => setSelectedUserProject(null)}
            onDelete={async (id) => {
              await fetch(`/api/user-projects/${id}`, { method: 'DELETE' });
              setSelectedUserProject(null);
              if (!isAdmin) refreshUserProjects();
            }}
            onRefresh={() => {
              if (isAdmin) {
                // Admin: fetch status for this specific project and update userProjects list
                fetch(`/api/user-projects/${selectedUserProject.id}/status`)
                  .then(r => r.json())
                  .then(s => {
                    setUserProjects(prev => prev.map(p =>
                      p.id === selectedUserProject.id ? { ...p, status: s.status } : p
                    ));
                    setSelectedUserProject((prev: any) => prev ? { ...prev, status: s.status } : prev);
                  })
                  .catch(() => {});
              } else {
                refreshUserProjects();
              }
            }}
            initialMessages={chatHistoryCache.current.get(selectedUserProject.id)}
            onMessagesChange={(msgs) => chatHistoryCache.current.set(selectedUserProject.id, msgs)}
          />
        ) : selectedProject ? (
          /* ── Completed agent project view ── */
          (() => {
            // If wiki already built → show full UserProjectView
            const up = userProjects.find(u => u.id === selectedProject.id);
            if (up) {
              return (
                <UserProjectView
                  key={up.id}
                  project={up}
                  onBack={() => setSelectedProject(null)}
                  onDelete={async (id) => {
                    await fetch(`/api/user-projects/${id}`, { method: 'DELETE' });
                    setSelectedProject(null);
                    refreshUserProjects();
                  }}
                  onRefresh={refreshUserProjects}
                  initialMessages={chatHistoryCache.current.get(up.id)}
                  onMessagesChange={(msgs) => chatHistoryCache.current.set(up.id, msgs)}
                />
              );
            }
            return (
              <CompletedProjectView
                key={selectedProject.id}
                project={selectedProject}
                onBack={() => setSelectedProject(null)}
                onWikiBuilt={refreshUserProjects}
              />
            );
          })()
        ) : activeView === 'graph' ? (
          /* ── Knowledge Graph view ── */
          <div className="flex-1 overflow-hidden">
            <KnowledgeGraph />
          </div>
        ) : activeView === 'query' ? (
          /* ── Chatbot query view ── */
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 mb-2">Standard Knowledge Base</h2>
                  <p className="text-sm text-slate-500 max-w-md mb-6">
                    Ask questions about the engineering knowledge base. The agent navigates wiki pages, follows links, and queries SQL tables to find answers with cited sources.
                  </p>
                  <div className="flex flex-wrap gap-2 max-w-lg justify-center">
                    {[
                      'What is the document numbering convention?',
                      'What pipe specifications are used?',
                      'What are the electrical design criteria?',
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setChatInput(q); }}
                        className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-slate-900 text-white'
                          : msg.role === 'error'
                          ? 'bg-red-50 border border-red-100 text-red-600'
                          : 'bg-slate-50 border border-slate-100 text-slate-700'
                      }`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="h-4 w-4 bg-emerald-100 rounded flex items-center justify-center">
                              <BookOpen className="w-2.5 h-2.5 text-emerald-600" />
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Wiki Agent</span>
                          </div>
                        )}
                        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user' ? '' : 'font-mono text-[13px]'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 max-w-[75%]">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                          <span className="font-medium">{thinkingStep || 'Agent is working…'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Input bar (pinned to bottom) */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Ask about the engineering knowledge base…"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()}
                    disabled={chatLoading}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={handleChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── All Documents view ── */
          <>
            {/* Search + filter */}
            <header className="px-6 py-3 bg-white border-b border-outline-variant/10 flex items-center gap-3 shrink-0">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by document ID, type, or folder…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button className="p-2 border border-outline-variant/30 rounded-lg hover:bg-surface-container-low transition-colors">
                <Filter className="w-4 h-4 text-slate-500" />
              </button>
              {data && (
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {filtered.length} / {allDocs.length} docs
                </span>
              )}
            </header>

            {/* Doc type pills */}
            {!loading && data && (
              <div className="px-6 py-3 bg-white border-b border-outline-variant/10 flex items-center gap-2 overflow-x-auto shrink-0">
                {(['PRC', 'LST', 'SPC', 'DST', 'PKG'] as const).map(type => {
                  const style = getDocTypeStyle(type);
                  const count = filtered.filter(d => d.doc_type === type).length;
                  if (count === 0) return null;
                  return (
                    <span key={type} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${style.bg} ${style.text}`}>
                      <style.icon className="w-3 h-3" />
                      {type} <span className="font-mono opacity-60">{count}</span>
                    </span>
                  );
                })}
                {filtered.some(d => d.is_template) && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shrink-0 bg-slate-100 text-slate-500">
                    Template <span className="font-mono opacity-60">{filtered.filter(d => d.is_template).length}</span>
                  </span>
                )}
              </div>
            )}

            {/* Document grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse border border-outline-variant/5">
                      <div className="h-3 bg-slate-100 rounded w-1/3 mb-3" />
                      <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-slate-400 text-sm">
                    {search ? `No documents match "${search}"` : 'No documents in this discipline.'}
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={String(selectedDisc)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3"
                  >
                    {filtered.map(doc => {
                      const style = getDocTypeStyle(doc.doc_type);
                      const Icon  = style.icon;
                      return (
                        <div
                          key={doc.doc_id}
                          className="bg-white rounded-xl p-4 border border-outline-variant/5 hover:shadow-md transition-all group cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className={`p-2 rounded-lg shrink-0 ${style.bg}`}>
                              <Icon className={`w-4 h-4 ${style.text}`} />
                            </div>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {doc.doc_type && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${style.bg} ${style.text}`}>{doc.doc_type}</span>
                              )}
                              {doc.is_template && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-400">TMPL</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-primary-container transition-colors break-all leading-snug mb-2">
                            {doc.doc_id}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {doc.source_folder && (
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${folderColor(doc.source_folder)}`}>{doc.source_folder}</span>
                            )}
                            {doc.revision && (
                              <span className="text-[10px] font-mono text-slate-400">{doc.revision}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </>
        )}
      </main>
    </motion.div>
  );
};
