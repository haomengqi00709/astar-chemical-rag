import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Filter, PlayCircle, FileText, Table2, Settings, Package, Layers,
  ChevronDown, ChevronRight, Briefcase, FlaskConical, Wrench, ArrowLeft, X,
} from 'lucide-react';
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
  const ctx        = project.context ?? {};
  const register   = (ctx.document_register ?? []) as any[];
  const deliverables: Record<string, string> = ctx.deliverables ?? {};
  const docStatus: Record<string, any>       = project.docStatus ?? {};
  const ps         = ctx.project_summary;

  const savedDocs = register.filter((d: any) => !!deliverables[d.doc_id]);
  const selectedDoc = selectedDocId ? register.find((d: any) => d.doc_id === selectedDocId) : null;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* File list */}
      <div className={`overflow-y-auto ${selectedDocId ? 'w-80 shrink-0 border-r border-slate-100' : 'flex-1'}`}>
        {/* Project header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <p className="text-lg font-extrabold text-slate-900">{ps?.project_title ?? project.id}</p>
          <p className="text-xs text-slate-400 mt-0.5">{ps?.client} · {ps?.location}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Completed</span>
            <span className="text-[10px] font-mono text-slate-400">{savedDocs.length} file{savedDocs.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

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
  );
};

// ─── Main Library component ──────────────────────────────────────────────────

export const Library: React.FC = () => {
  const [data,              setData]              = useState<LibraryData | null>(null);
  const [loading,           setLoading]           = useState(true);
  const [selectedDisc,      setSelectedDisc]      = useState<number | 'all'>('all');
  const [search,            setSearch]            = useState('');

  // sidebar section open states
  const [standardOpen,      setStandardOpen]      = useState(true);
  const [refProjectsOpen,   setRefProjectsOpen]   = useState(true);

  // reference projects
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [selectedProject,   setSelectedProject]   = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/library')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/projects')
      .then(r => r.json())
      .then((ps: any[]) => setCompletedProjects(ps.filter(p => p.status === 'completed')))
      .catch(() => {});
  }, []);

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

          {standardOpen && (
            <nav className="py-1">
              <button
                onClick={() => { setSelectedDisc('all'); setSelectedProject(null); }}
                className={`w-full flex items-center justify-between px-5 py-2.5 text-sm transition-colors ${
                  !selectedProject && selectedDisc === 'all'
                    ? 'bg-primary-container/10 text-primary-container font-bold border-r-2 border-primary-container'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs">All Documents</span>
                {data && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                    {data.total_docs}
                  </span>
                )}
              </button>

              {ALL_DISCIPLINES.map(disc => {
                const hasData = presentIds.has(disc.id);
                const count   = discCount[disc.id] ?? 0;
                const active  = !selectedProject && selectedDisc === disc.id;
                return (
                  <button
                    key={disc.id}
                    onClick={() => { if (hasData) { setSelectedDisc(disc.id); setSelectedProject(null); } }}
                    className={`w-full flex items-center justify-between px-5 py-2 text-sm transition-colors ${
                      !hasData
                        ? 'text-slate-300 cursor-default'
                        : active
                        ? 'bg-primary-container/10 text-primary-container font-bold border-r-2 border-primary-container'
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
            </nav>
          )}
        </div>

        {/* ── Reference Projects section ── */}
        <div className="border-t border-outline-variant/10">
          <button
            onClick={() => setRefProjectsOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Reference Projects</p>
              {completedProjects.length > 0 && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{completedProjects.length} completed</p>
              )}
            </div>
            {refProjectsOpen
              ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          </button>

          {refProjectsOpen && (
            <nav className="py-2 border-t border-outline-variant/10">
              {completedProjects.length === 0 ? (
                <p className="pl-8 pr-4 py-2 text-[11px] text-slate-300 italic">No completed projects yet.</p>
              ) : (
                <div className="ml-5 border-l-2 border-slate-100">
                  {completedProjects.map(proj => {
                    const ps     = proj.context?.project_summary;
                    const active = selectedProject?.id === proj.id;
                    return (
                      <button
                        key={proj.id}
                        onClick={() => setSelectedProject(active ? null : proj)}
                        className={`w-full text-left pl-4 pr-3 py-2 transition-colors relative ${
                          active
                            ? 'bg-primary-container/10 text-primary-container border-r-2 border-primary-container'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <p className={`text-[11px] truncate leading-snug ${active ? 'font-bold' : 'font-medium'}`}>
                          {ps?.project_title ?? proj.id}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{ps?.client ?? ''}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </nav>
          )}
        </div>

        {/* Bottom stats (standard mode only) */}
        {!selectedProject && data && (
          <div className="mt-auto px-5 py-4 border-t border-outline-variant/10 space-y-2">
            <div>
              <p className="text-[10px] text-slate-400">Chunks indexed</p>
              <p className="text-base font-mono font-bold">7,843</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Last sync</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-medium text-emerald-600">Live</p>
              </div>
            </div>
            <button className="w-full mt-2 bg-primary-container text-white py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-colors">
              <PlayCircle className="w-3.5 h-3.5" />
              Re-Index
            </button>
          </div>
        )}
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {selectedProject ? (
          /* ── Reference project view ── */
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedProject.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <header className="px-6 py-3 bg-white border-b border-outline-variant/10 flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Reference Projects
                </button>
                <span className="text-slate-200">/</span>
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {selectedProject.context?.project_summary?.project_title ?? selectedProject.id}
                </span>
              </header>
              <div className="flex-1 overflow-hidden">
                <ProjectRefView project={selectedProject} />
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          /* ── Standard library view ── */
          <>
            <header className="px-6 py-4 bg-white border-b border-outline-variant/10 flex items-center gap-3 shrink-0">
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
