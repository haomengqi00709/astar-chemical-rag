import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import mammoth from 'mammoth';
import {
  CheckCircle, Circle, Clock, AlertTriangle, ChevronRight,
  ArrowLeft, Upload, Play, Loader2, FlaskConical, Wrench,
  Briefcase, FileText, X, ChevronDown, ChevronUp,
  Users, MessageCircle, Send, Trash2, Eye, BookmarkPlus, BookCheck,
} from 'lucide-react';
import { User, AgentStatus, Role } from '../types';

interface DashboardProps { user: User; isAdmin?: boolean; }

// ─── Helpers ───────────────────────────────────────────────────────────────

const ROLE_OWNER: Record<string, string> = {
  PM: 'Daniel',
  'Process Engineer': 'Aria',
  'Mechanical Engineer': 'Hunter',
};

function docStatus(
  doc: any,
  status: AgentStatus,
): 'done' | 'active' | 'pending' {
  const a = doc.assigned_to;
  if (a === 'PM')
    return status.pm.project_context ? 'done' : 'active';
  if (a === 'Process Engineer') {
    if (!status.pm.project_context) return 'pending';
    return status.process.process_output ? 'done' : 'active';
  }
  if (a === 'Mechanical Engineer') {
    if (!status.process.process_output) return 'pending';
    return status.mechanical.mechanical_output ? 'done' : 'active';
  }
  return 'pending';
}

function projectCompletion(docs: any[], docStatusMap: Record<string, any>) {
  if (!docs.length) return 0;
  const approved = docs.filter(d => docStatusMap[d.doc_id]?.status === 'approved').length;
  return Math.round((approved / docs.length) * 100);
}

function pipelineStatuses(status: AgentStatus) {
  return {
    pm:         status.pm.project_context           ? 'done' : 'active',
    process:    status.process.process_output       ? 'done' : status.pm.project_context ? 'active' : 'pending',
    mechanical: status.mechanical.mechanical_output ? 'done' : status.process.process_output ? 'active' : 'pending',
  } as const;
}

const RiskBadge: React.FC<{ condition: string }> = ({ condition }) => {
  const cfg: Record<string, { label: string; color: string }> = {
    corrosive_fluid: { label: 'Corrosive',    color: 'bg-red-100 text-red-700 border-red-200' },
    high_pressure:   { label: 'High Pressure', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  };
  const c = cfg[condition] ?? { label: condition, color: 'bg-slate-100 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.color}`}>
      <AlertTriangle className="w-2.5 h-2.5" /> {c.label}
    </span>
  );
};

const DocStatusIcon: React.FC<{ status: 'done' | 'active' | 'pending' }> = ({ status }) =>
  status === 'done'    ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> :
  status === 'active'  ? <Clock       className="w-4 h-4 text-blue-400 shrink-0" />   :
                         <Circle      className="w-4 h-4 text-slate-300 shrink-0" />;

// ─── Document status config ─────────────────────────────────────────────────

const DOC_STATUS_CFG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:      { label: 'Pending',      color: 'text-slate-500',   bg: 'bg-slate-100',   dot: 'bg-slate-300' },
  in_progress:  { label: 'In Progress',  color: 'text-blue-700',    bg: 'bg-blue-100',    dot: 'bg-blue-400' },
  under_review: { label: 'Under Review', color: 'text-amber-700',   bg: 'bg-amber-100',   dot: 'bg-amber-400' },
  approved:     { label: 'Approved',     color: 'text-emerald-700', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
};

// ─── Expandable Doc Row ─────────────────────────────────────────────────────

const DocRow: React.FC<{
  doc: any;
  entry: { status: string; comments: any[] } | null;
  isMine: boolean;
  canEdit: boolean;
  canApprove: boolean;
  isReleased: boolean;  // false = Gate 1 (scope review), true = Gate 2 (work tracking)
  generatedContent?: string;
  onViewDocument?: () => void;
  onStatusChange: (status: string) => void;
  onAddComment:   (text: string)   => void;
  extraContent?: React.ReactNode;  // injected into the expanded panel (e.g. ProcessStepsPanel)
}> = ({ doc, entry, isMine, canEdit, canApprove, isReleased, generatedContent, onViewDocument, onStatusChange, onAddComment, extraContent }) => {
  const [expanded,    setExpanded]    = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  const currentStatus = entry?.status ?? 'pending';
  const comments      = entry?.comments ?? [];
  const cfg           = DOC_STATUS_CFG[currentStatus] ?? DOC_STATUS_CFG.pending;

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onAddComment(commentText.trim());
    setCommentText('');
    setSubmitting(false);
  };

  return (
    <div className={`border-b border-slate-50 last:border-0 ${isMine ? 'bg-blue-50/30' : ''}`}>
      {/* Summary row */}
      <div
        onClick={() => setExpanded(e => !e)}
        className={`flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-slate-50/80 transition-colors ${isMine ? 'border-l-2 border-blue-400' : ''}`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-blue-700 shrink-0">{doc.doc_id}</span>
            <span className="text-sm text-slate-800 truncate">{doc.title}</span>
            {isMine && <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full uppercase shrink-0">Mine</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-slate-400 hidden sm:block">{ROLE_OWNER[doc.assigned_to] ?? doc.assigned_to}</span>
          <span className="text-[10px] font-mono text-slate-400 w-24">{doc.planned_date}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
          {/* Comment count (Gate 2 only) */}
          {isReleased && comments.filter(c => c.type === 'comment').length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <MessageCircle className="w-3 h-3" /> {comments.filter(c => c.type === 'comment').length}
            </span>
          )}
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-6 pb-4 pt-2 bg-white/60 space-y-3 border-l-4 border-slate-100 ml-6">

          {/* Extra content (e.g. ProcessStepsPanel) — always shown when expanded */}
          {extraContent}

          {!isReleased ? (
            /* ── Gate 1: PM reviews Gemini's suggested deliverable ── */
            canApprove ? (
              <div className="space-y-3">
                {/* Deliverable details from Gemini */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['Assigned To',  doc.assigned_to],
                    ['Planned Date', doc.planned_date],
                    ['Doc Type',     doc.doc_type ?? '—'],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-[10px] font-mono text-slate-400 mb-0.5">{label}</p>
                      <p className="text-xs font-semibold text-slate-700">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Generated document — opens modal + DOCX download */}
                {generatedContent && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDocument?.()}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {canEdit ? <FileText className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {canEdit ? 'View / Edit Generated Document' : 'View Generated Document'}
                    </button>
                    {(doc.assigned_to === 'PM' || doc.assigned_to === 'Process Engineer' || (doc.assigned_to === 'Mechanical Engineer' && doc.type !== 'CAL')) && (
                      <a
                        href={`/files/${doc.assigned_to === 'Process Engineer' ? 'process' : doc.assigned_to === 'Mechanical Engineer' ? 'mechanical' : 'pm'}-deliverables/${doc.doc_id.replace(/\//g, '_').replace(/\./g, '_')}.docx`}
                        download
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Download .docx
                      </a>
                    )}
                    {(doc.assigned_to === 'Process Engineer' || doc.assigned_to === 'Mechanical Engineer') && doc.type === 'CAL' && (
                      <a
                        href={`/files/${doc.assigned_to === 'Mechanical Engineer' ? 'mechanical' : 'process'}-deliverables/${doc.doc_id.replace(/\//g, '_').replace(/\./g, '_')}.xlsx`}
                        download
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Download .xlsx
                      </a>
                    )}
                  </div>
                )}

                {/* Approve / undo */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-slate-500">Do you agree this deliverable should be in scope?</p>
                  <button
                    onClick={() => onStatusChange(currentStatus === 'approved' ? 'pending' : 'approved')}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all shrink-0 ${
                      currentStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {currentStatus === 'approved' ? '✓ Approved — undo' : 'Approve'}
                  </button>
                </div>

                {/* Note */}
                <div className="flex gap-2">
                  <input
                    type="text" value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleComment(); }}
                    placeholder="Add a note…"
                    className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button onClick={handleComment} disabled={!commentText.trim() || submitting}
                    className="text-xs bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-700 font-semibold px-3 py-2 rounded-lg transition-colors flex items-center">
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {comments.filter((c: any) => c.type === 'comment').map((c: any) => (
                  <div key={c.id} className="text-xs bg-white border border-slate-100 rounded-lg px-3 py-2 text-slate-700">
                    <span className="font-semibold text-slate-900 mr-1">{c.author}</span>{c.text}
                    <span className="block text-[10px] text-slate-400 mt-0.5">{new Date(c.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {isMine && generatedContent && (
                  <div className="flex items-center flex-wrap gap-2">
                    <button
                      onClick={() => onViewDocument?.()}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> View / Edit Generated Document
                    </button>
                    {(doc.assigned_to === 'PM' || doc.assigned_to === 'Process Engineer' || (doc.assigned_to === 'Mechanical Engineer' && doc.type !== 'CAL')) && (
                      <a
                        href={`/files/${doc.assigned_to === 'Process Engineer' ? 'process' : doc.assigned_to === 'Mechanical Engineer' ? 'mechanical' : 'pm'}-deliverables/${doc.doc_id.replace(/\//g, '_').replace(/\./g, '_')}.docx`}
                        download
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Download .docx
                      </a>
                    )}
                    {(doc.assigned_to === 'Process Engineer' || doc.assigned_to === 'Mechanical Engineer') && doc.type === 'CAL' && (
                      <a
                        href={`/files/${doc.assigned_to === 'Mechanical Engineer' ? 'mechanical' : 'process'}-deliverables/${doc.doc_id.replace(/\//g, '_').replace(/\./g, '_')}.xlsx`}
                        download
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Download .xlsx
                      </a>
                    )}
                  </div>
                )}
                <p className="text-xs text-slate-500 italic py-1">Awaiting PM review before work begins.</p>
              </div>
            )
          ) : (
            /* ── Gate 2: Work tracking ── */
            <>
              {/* Generated document + download buttons */}
              {generatedContent && (
                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={() => onViewDocument?.()}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {canEdit ? <FileText className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {canEdit ? 'View / Edit Generated Document' : 'View Generated Document'}
                  </button>
                  {(doc.assigned_to === 'PM' || doc.assigned_to === 'Process Engineer' || (doc.assigned_to === 'Mechanical Engineer' && doc.type !== 'CAL')) && (
                    <a
                      href={`/files/${doc.assigned_to === 'Process Engineer' ? 'process' : doc.assigned_to === 'Mechanical Engineer' ? 'mechanical' : 'pm'}-deliverables/${doc.doc_id.replace(/\//g, '_').replace(/\./g, '_')}.docx`}
                      download
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> Download .docx
                    </a>
                  )}
                  {(doc.assigned_to === 'Process Engineer' || doc.assigned_to === 'Mechanical Engineer') && doc.type === 'CAL' && (
                    <a
                      href={`/files/${doc.assigned_to === 'Mechanical Engineer' ? 'mechanical' : 'process'}-deliverables/${doc.doc_id.replace(/\//g, '_').replace(/\./g, '_')}.xlsx`}
                      download
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> Download .xlsx
                    </a>
                  )}
                </div>
              )}

              {canEdit && (
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(['pending', 'in_progress', 'under_review', 'approved'] as const)
                      .filter(s => s !== 'approved' || canApprove)
                      .map(s => {
                        const c = DOC_STATUS_CFG[s];
                        return (
                          <button key={s} onClick={() => onStatusChange(s)}
                            className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                              currentStatus === s
                                ? `${c.bg} ${c.color} border-transparent ring-2 ring-offset-1 ring-blue-300`
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                            }`}>
                            {c.label}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {comments.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Activity</p>
                  {comments.map((c: any) => (
                    <div key={c.id} className={`text-xs rounded-lg px-3 py-2 ${c.type === 'system' ? 'bg-slate-100 text-slate-500 italic' : 'bg-white border border-slate-100 text-slate-700'}`}>
                      {c.type !== 'system' && <span className="font-semibold text-slate-900 mr-1">{c.author}</span>}
                      {c.text}
                      <span className="block text-[10px] text-slate-400 mt-0.5">{new Date(c.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input type="text" value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleComment(); }}
                  placeholder="Add a comment…"
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button onClick={handleComment} disabled={!commentText.trim() || submitting}
                  className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg transition-colors flex items-center">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>

            </>
          )}

        </div>
      )}
    </div>
  );
};

const PipelineStep: React.FC<{
  label: string; name: string;
  status: 'done' | 'active' | 'pending';
  isMe?: boolean;
}> = ({ label, name, status, isMe }) => (
  <div className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl transition-all ${isMe ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-slate-50'}`}>
    {status === 'done'   ? <CheckCircle className="w-6 h-6 text-emerald-500" /> :
     status === 'active' ? <Clock       className="w-6 h-6 text-blue-500" />   :
                           <Circle      className="w-6 h-6 text-slate-300" />}
    <p className={`text-xs font-bold text-center ${status === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>{label}</p>
    <p className="text-[10px] text-slate-400 text-center leading-tight">{name}</p>
    {isMe && <span className="text-[8px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">You</span>}
  </div>
);

// ─── Team Sections Panel ────────────────────────────────────────────────────

const TEAM_ROLES: { key: 'process' | 'mechanical'; label: string; Icon: React.FC<any> }[] = [
  { key: 'process',    label: 'Process Engineer',    Icon: FlaskConical },
  { key: 'mechanical', label: 'Mechanical Engineer', Icon: Wrench },
];

const TeamSectionsPanel: React.FC<{
  sessions:    any[];
  parentDocId: string;
  userRole:    Role;
  hasContent:  boolean;
  isRunning:   boolean;
  onRun:       (role: string) => void;
  onOpen:      (parentDocId: string, session: any) => void;
  onRelease:   (sessionId: string, released: boolean) => void;
}> = ({ sessions, parentDocId, userRole, hasContent, isRunning, onRun, onOpen, onRelease }) => {

  // Engineer view — only show their own released section
  if (userRole !== 'pm') {
    const mine = sessions.find(s => s.owner === userRole && s.released);
    if (!mine || !hasContent) return null;
    return (
      <div className="border-t border-slate-100 pt-2 mt-1">
        <button
          onClick={() => onOpen(parentDocId, mine)}
          className="flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <FileText className="w-3 h-3" /> Open / Edit My Section
        </button>
      </div>
    );
  }

  // PM view — two rows, one per engineer role
  return (
    <div className="border-t border-slate-100 pt-3 mt-1">
      <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mb-2">Team Sections</p>
      <div className="space-y-1.5">
        {TEAM_ROLES.map(({ key, label, Icon }) => {
          const session    = sessions.find((s: any) => s.owner === key);
          const isReleased = session?.released ?? false;
          const ready      = !!session && hasContent;

          return (
            <div key={key} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
              <Icon className={`w-3.5 h-3.5 shrink-0 ${key === 'process' ? 'text-emerald-600' : 'text-orange-500'}`} />
              <span className="text-xs font-medium text-slate-700 flex-1">{label}</span>

              {/* Run → View/Edit */}
              {ready ? (
                <button
                  onClick={() => onOpen(parentDocId, session)}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0"
                >
                  View / Edit
                </button>
              ) : (
                <button
                  onClick={() => onRun(key)}
                  disabled={isRunning}
                  className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-blue-50 text-slate-600 hover:text-blue-700 disabled:opacity-50 transition-colors shrink-0"
                >
                  {isRunning
                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Running…</>
                    : 'Run ▷'}
                </button>
              )}

              {/* Send */}
              <button
                onClick={() => session && onRelease(session.id, !isReleased)}
                disabled={!ready}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  isReleased
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-red-50 hover:text-red-600'
                    : ready
                    ? 'bg-slate-200 text-slate-600 hover:bg-blue-100 hover:text-blue-700'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                {isReleased ? '✓ Sent' : 'Send →'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ─── Project Card ──────────────────────────────────────────────────────────

const ProjectCard: React.FC<{
  project: any; status: AgentStatus; userRole: Role; docStatusMap: Record<string, any>; onClick: () => void;
}> = ({ project, status, userRole, docStatusMap, onClick }) => {
  const ps = project.project_summary;
  const docs = project.document_register ?? [];
  const flags = project.risk_flags_fired ?? [];
  const pct = projectCompletion(docs, docStatusMap);
  const pipe = pipelineStatuses(status);
  const isDraft = docStatusMap.__project?.status !== 'published';

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-soft border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* colour bar */}
      <div className={`h-1 w-full ${pct === 100 ? 'bg-emerald-400' : pct > 0 ? 'bg-blue-400' : 'bg-slate-200'}`} />

      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-slate-900 text-base leading-tight">{ps?.project_title ?? 'Untitled Project'}</h3>
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {flags.map((f: any) => <RiskBadge key={f.condition} condition={f.condition} />)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDraft && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">Draft</span>}
            <p className="text-xs text-slate-500">{ps?.client} · {ps?.location}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Progress</span>
            <span className="text-[10px] font-mono font-bold text-slate-600">
              {docs.filter((d: any) => docStatusMap[d.doc_id]?.status === 'approved').length}/{docs.length} approved · {pct}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-emerald-400' : 'bg-blue-400'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Pipeline dots */}
        <div className="flex items-center gap-2">
          {(['pm', 'process', 'mechanical'] as const).map((stage, i) => (
            <React.Fragment key={stage}>
              {i > 0 && <div className={`flex-1 h-px ${pipe[stage] !== 'pending' ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${pipe[stage] === 'done' ? 'bg-emerald-500' : pipe[stage] === 'active' ? 'bg-blue-400' : 'bg-slate-200'}`} />
            </React.Fragment>
          ))}
          <span className="text-[10px] font-mono text-slate-400 ml-1 shrink-0">PM · Process · Mech</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Aria · Hunter</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span className="font-mono">End {project.project_end_date?.slice(0, 7) ?? '—'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.button>
  );
};

// ─── Project Detail ────────────────────────────────────────────────────────

const ProjectDetailView: React.FC<{
  project: any;
  projectId: string | null;
  status: AgentStatus;
  userRole: Role;
  onBack: () => void;
  processOutput: any;
  mechanicalOutput: any;
  onRunAgent: (agentType?: 'process' | 'mechanical') => void;
  runningAgent: 'process' | 'mechanical' | null;
  agentError: string;
  docStatusMap: Record<string, any>;
  deliverables: Record<string, string>;
  processSteps: Record<string, any>;
  onDocStatusChange: (docId: string, status: string) => void;
  onDocComment: (docId: string, text: string) => void;
  sessionsConfig: Record<string, any[]>;
  onViewDocument: (docId: string, session?: any) => void;
  onReleaseSession: (docId: string, sessionId: string, released: boolean) => void;
  onSuggestSessions: (docId: string, role?: string) => void;
  suggestingSession: string | null;
  onRunStep: (step: number) => void;
  stepRunning: number | null;
  stepError: string;
  stepProgress: Record<number, 'running' | 'done'>;
  onPublish: () => void;
  onMarkComplete: () => void;
  onDelete: () => void;
  onBuildReference: () => Promise<{ pages: number } | null>;
  onViewSummary: (entry: { version: number; content: string; createdAt: string }) => void;
  isCompleted: boolean;
  isInLibrary: boolean;
}> = ({ project, projectId, status, userRole, sessionsConfig, onBack, processOutput, mechanicalOutput, onRunAgent, runningAgent, agentError, docStatusMap, deliverables, processSteps, onDocStatusChange, onDocComment, onViewDocument, onReleaseSession, onSuggestSessions, suggestingSession, onRunStep, stepRunning, stepError, stepProgress, onPublish, onMarkComplete, onDelete, onBuildReference, onViewSummary, isCompleted, isInLibrary }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [buildRefStatus, setBuildRefStatus] = useState<'idle' | 'building' | 'done' | 'error'>('idle');
  const [buildRefPages,  setBuildRefPages]  = useState(0);
  const [summaries,      setSummaries]      = useState<Array<{ version: number; createdAt: string; content: string }>>(() => project?.deliverable_summaries ?? []);
  useEffect(() => { setSummaries(project?.deliverable_summaries ?? []); }, [project?.deliverable_summaries]);
  const [summarizing,    setSummarizing]    = useState(false);
  const [summarizeError, setSummarizeError] = useState('');
  const [expandedSummary,    setExpandedSummary]    = useState<number | null>(null);
  const [summaryDownloading, setSummaryDownloading] = useState<number | null>(null);

  const handleSummarize = async () => {
    if (!projectId) return;
    setSummarizing(true);
    setSummarizeError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/summarize-deliverables`, { method: 'POST' });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      const data = await res.json();
      const newEntry = { version: data.version, createdAt: new Date().toISOString(), content: data.content };
      setSummaries(prev => [...prev, newEntry]);
      setExpandedSummary(data.version);
    } catch (e: any) {
      setSummarizeError(e.message || 'Summarize failed');
    } finally {
      setSummarizing(false);
    }
  };

  const ps      = project.project_summary;
  const allDocs = [...(project.document_register ?? [])].sort(
    (a, b) => new Date(a.planned_date).getTime() - new Date(b.planned_date).getTime()
  );

  // For non-PM roles: replace PM docs with their session slice cards
  const roleDocOwnerStr: Record<Role, string> = { pm: 'PM', process: 'Process Engineer', mechanical: 'Mechanical Engineer', owner: 'Owner' };
  // Sessions are now nested sub-items inside PM doc rows — not top-level cards
  const docs = allDocs;
  const flags = project.risk_flags_fired ?? [];
  const pipe  = pipelineStatuses(status);

  const fp = processOutput?.fluid_properties;
  const hr = processOutput?.hydraulic_results;
  const dc = processOutput?.design_criteria;
  const pc = mechanicalOutput?.pump_calculations;
  const ms = mechanicalOutput?.material_selection;

  const isPublished = docStatusMap.__project?.status === 'published';
  const pmDocsApproved = Object.entries(docStatusMap)
    .some(([k, v]: [string, any]) => k !== '__project' && v.status === 'approved');
  const isUnlocked = isPublished || pmDocsApproved;

  const canRun =
    isUnlocked &&
    (userRole === 'mechanical' || userRole === 'pm') &&
    !status.mechanical.mechanical_output &&
    status.process.process_output;

  const canShowProcessPanel = isUnlocked && (userRole === 'process' || userRole === 'pm') && status.pm.project_context;
  const canShowPumpPanel    = isUnlocked && (userRole === 'mechanical' || userRole === 'pm') && status.process.process_output;

  const roleDocOwner = roleDocOwnerStr;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 max-w-7xl mx-auto space-y-6">

      {/* Back + header */}
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Projects
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{ps?.project_title}</h1>
            <p className="text-slate-500 mt-1">
              {ps?.client} · {ps?.location} · <span className="font-mono text-xs">{project.project_type?.replace('_', ' ')}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-1 flex-wrap">
            {flags.map((f: any) => <RiskBadge key={f.condition} condition={f.condition} />)}
            {isCompleted ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">Completed</span>
                {userRole === 'pm' && (isInLibrary || buildRefStatus === 'done') ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    <BookCheck className="w-3 h-3" />
                    In Reference Library
                  </span>
                ) : userRole === 'pm' && (
                  <button
                    onClick={async () => {
                      setBuildRefStatus('building');
                      const result = await onBuildReference();
                      if (result) { setBuildRefStatus('done'); setBuildRefPages(result.pages); }
                      else setBuildRefStatus('error');
                    }}
                    disabled={buildRefStatus === 'building'}
                    className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-all disabled:opacity-60"
                  >
                    {buildRefStatus === 'building'
                      ? <><Loader2 className="w-3 h-3 animate-spin" /> Building…</>
                      : buildRefStatus === 'error'
                      ? 'Retry Reference Build'
                      : <><BookmarkPlus className="w-3 h-3" /> Add to Reference Library</>
                    }
                  </button>
                )}
              </div>
            ) : userRole === 'pm' && (
              <button onClick={onMarkComplete}
                className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-all">
                Mark Complete
              </button>
            )}
            {userRole === 'pm' && (
              <button onClick={() => setConfirmDelete(true)}
                className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 border border-slate-200 hover:border-red-300 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between gap-4"
        >
          <div>
            <p className="font-bold text-red-800">Delete this project?</p>
            <p className="text-sm text-red-700 mt-1">
              This will permanently remove <span className="font-semibold">{ps?.project_title}</span> and all its data. This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setConfirmDelete(false)}
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={onDelete}
              className="text-sm font-bold px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors">
              Delete Project
            </button>
          </div>
        </motion.div>
      )}

      {/* Gate 1 — PM reviews each deliverable individually */}
      {!isPublished && (() => {
        const approvedCount = docs.filter(d => docStatusMap[d.doc_id]?.status === 'approved').length;
        const allApproved   = approvedCount === docs.length;
        return userRole === 'pm' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-amber-800">Review Each Deliverable</p>
              <p className="text-sm text-amber-700 mt-1">
                {docs.length} deliverables have been suggested. Expand each one below and approve it individually before releasing to the team.
              </p>
              <p className="text-xs font-mono mt-2 font-bold text-amber-700">
                {approvedCount} / {docs.length} approved
              </p>
            </div>
            <button
              onClick={onPublish}
              className={`shrink-0 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow whitespace-nowrap ${
                allApproved
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-amber-400 hover:bg-amber-500 text-white'
              }`}
            >
              {allApproved ? 'Release to Team ✓' : 'Release to Team'}
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-amber-800">Awaiting PM Approval</p>
              <p className="text-sm text-amber-700 mt-0.5">Daniel is reviewing each deliverable. Work will begin once the project is released.</p>
            </div>
          </div>
        );
      })()}

      {/* Pipeline */}
      <section className="bg-white rounded-2xl p-5 shadow-soft">
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">Pipeline</p>
        <div className="flex items-center gap-2">
          <PipelineStep label="PM Agent"        name="Daniel"  status={pipe.pm}         isMe={userRole === 'pm'} />
          <div className={`flex-none w-8 h-px ${pipe.process !== 'pending' ? 'bg-emerald-300' : 'bg-slate-200'}`} />
          <PipelineStep label="Process Agent"   name="Aria"    status={pipe.process}    isMe={userRole === 'process'} />
          <div className={`flex-none w-8 h-px ${pipe.mechanical !== 'pending' ? 'bg-emerald-300' : 'bg-slate-200'}`} />
          <PipelineStep label="Mechanical Agent" name="Hunter" status={pipe.mechanical} isMe={userRole === 'mechanical'} />
        </div>
        {agentError && <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{agentError}</p>}
      </section>

      <div className="grid grid-cols-12 gap-6">

        {/* Document register */}
        <section className="col-span-12 lg:col-span-7 bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Document Register</p>
              <p className="text-xs text-slate-400 font-mono">{docs.length} deliverables · sorted by planned date</p>
            </div>
            <div className="flex gap-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Pending</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> In Progress</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Review</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Approved</span>
            </div>
          </div>
          <div>
            {docs.map((doc: any) => (
              <DocRow
                key={doc.doc_id}
                doc={doc}
                entry={docStatusMap[doc.doc_id] ?? null}
                isMine={doc.assigned_to === roleDocOwner[userRole]}
                canEdit={userRole === 'pm' || (isPublished && doc.assigned_to === roleDocOwner[userRole])}
                canApprove={userRole === 'pm'}
                isReleased={isPublished}
                generatedContent={deliverables[doc.doc_id]}
                onViewDocument={deliverables[doc.doc_id] ? () => onViewDocument(doc.doc_id) : undefined}
                onStatusChange={(s) => onDocStatusChange(doc.doc_id, s)}
                onAddComment={(t) => onDocComment(doc.doc_id, t)}
                extraContent={
                  doc.assigned_to === 'PM'
                    ? (
                      <TeamSectionsPanel
                        sessions={sessionsConfig[doc.doc_id] ?? []}
                        parentDocId={doc.doc_id}
                        userRole={userRole}
                        hasContent={!!deliverables[doc.doc_id]}
                        isRunning={suggestingSession === doc.doc_id}
                        onRun={(role) => onSuggestSessions(doc.doc_id, role)}
                        onOpen={(parentDocId, session) => onViewDocument(parentDocId, session)}
                        onRelease={(sessionId, released) => onReleaseSession(doc.doc_id, sessionId, released)}
                      />
                    )
                  : canShowProcessPanel && doc.assigned_to === 'Process Engineer' && doc.doc_id.includes('CAL')
                    ? (
                      <ProcessStepsPanel
                        processSteps={processSteps}
                        onRunStep={onRunStep}
                        onRunAll={() => onRunAgent('process')}
                        stepRunning={stepRunning}
                        allRunning={runningAgent === 'process'}
                        stepProgress={stepProgress}
                        error={stepError || agentError}
                      />
                    )
                  : canShowPumpPanel && doc.assigned_to === 'Mechanical Engineer' && doc.doc_id.includes('CAL')
                    ? (
                      <PumpCalcPanel
                        mechanicalOutput={mechanicalOutput}
                        onRun={() => onRunAgent('mechanical')}
                        running={runningAgent === 'mechanical'}
                        error={agentError}
                      />
                    )
                  : undefined
                }
              />
            ))}
          </div>
        </section>

        {/* Right panel */}
        <div className="col-span-12 lg:col-span-5 space-y-4">

          {/* Team */}
          <section className="bg-white rounded-2xl p-5 shadow-soft">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">Team</p>
            <div className="space-y-3">
              {[
                { icon: <Briefcase className="w-4 h-4 text-blue-500" />, name: 'Daniel', title: 'Project Manager', done: status.pm.project_context, bg: 'bg-blue-50' },
                { icon: <FlaskConical className="w-4 h-4 text-emerald-500" />, name: 'Aria', title: 'Process Engineer', done: status.process.process_output, bg: 'bg-emerald-50' },
                { icon: <Wrench className="w-4 h-4 text-orange-500" />, name: 'Hunter', title: 'Mechanical Engineer', done: status.mechanical.mechanical_output, bg: 'bg-orange-50' },
              ].map(m => (
                <div key={m.name} className={`flex items-center gap-3 ${m.bg} rounded-xl px-4 py-3`}>
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm">{m.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.title}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.done ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {m.done ? 'Complete' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Key parameters */}
          <section className="bg-white rounded-2xl p-5 shadow-soft">
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">Key Parameters</p>
            <div className="space-y-2 text-sm">
              {[
                ['Fluid',       ps?.fluid],
                ['Flow Rate',   ps?.flow_rate_m3h ? `${ps.flow_rate_m3h} m³/h` : null],
                ['Design P',    ps?.design_pressure_bar ? `${ps.design_pressure_bar} bar` : null],
                ['Temperature', ps?.temperature_c ? `${ps.temperature_c} °C` : null],
              ].map(([label, val]) => val && (
                <div key={label} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500 text-xs">{label}</span>
                  <span className="text-slate-900 font-medium text-xs">{val}</span>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Deliverable Summaries — same width as Document Register */}
        {userRole === 'pm' && (
          <section className="col-span-12 lg:col-span-7 bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Deliverable Summaries</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {summaries.length > 0 ? `${summaries.length} version${summaries.length !== 1 ? 's' : ''} · latest v${summaries[summaries.length - 1].version}` : 'No summaries yet'}
                </p>
              </div>
              <button
                onClick={handleSummarize}
                disabled={summarizing || Object.keys(deliverables).length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {summarizing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Summarizing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Summarize Deliverables
                  </>
                )}
              </button>
            </div>

            {summarizeError && (
              <p className="px-6 py-3 text-xs text-red-600 bg-red-50">{summarizeError}</p>
            )}

            {summaries.length === 0 && !summarizing && (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">
                Click "Summarize Deliverables" to generate an AI summary of all current deliverables.
              </div>
            )}

            {summaries.length > 0 && (
              <div className="divide-y divide-slate-50">
                {[...summaries].reverse().map(entry => (
                  <div key={entry.version} className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedSummary(expandedSummary === entry.version ? null : entry.version)}
                        className="flex-1 flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">v{entry.version}</span>
                          <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span>
                        </div>
                        <svg
                          className={`w-4 h-4 text-slate-400 transition-transform ${expandedSummary === entry.version ? 'rotate-180' : ''}`}
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                      <button
                        onClick={async () => {
                          if (!projectId) return;
                          setSummaries(prev => prev.filter(s => s.version !== entry.version));
                          if (expandedSummary === entry.version) setExpandedSummary(null);
                          await fetch(`/api/projects/${projectId}/delete-summary`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ version: entry.version }),
                          }).catch(console.error);
                        }}
                        className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete this version"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {expandedSummary === entry.version && (
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center flex-wrap gap-2">
                          <button
                            onClick={() => onViewSummary(entry)}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Document
                          </button>
                          <button
                            onClick={() => {
                              const blob = new Blob([entry.content], { type: 'text/markdown' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `deliverable_summary_v${entry.version}.md`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> Download .md
                          </button>
                          <button
                            disabled={summaryDownloading === entry.version}
                            onClick={async () => {
                              if (!projectId) return;
                              setSummaryDownloading(entry.version);
                              try {
                                const res = await fetch(`/api/projects/${projectId}/export-summary-docx`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ version: entry.version, content: entry.content }),
                                });
                                const data = await res.json();
                                if (data.url) {
                                  const a = document.createElement('a');
                                  a.href = data.url;
                                  a.download = `deliverable_summary_v${entry.version}.docx`;
                                  a.click();
                                }
                              } finally { setSummaryDownloading(null); }
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {summaryDownloading === entry.version
                              ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                              : <FileText className="w-3.5 h-3.5" />}
                            Download .docx
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </div>

      {/* ── Project Files ─────────────────────────────────────────────────── */}
      {(() => {
        const ROLE_GROUPS = [
          { key: 'PM',                  label: 'Project Manager',     color: 'text-blue-600',    border: 'border-blue-100',    bg: 'bg-blue-50',    dot: 'bg-blue-500' },
          { key: 'Process Engineer',    label: 'Process Engineer',    color: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
          { key: 'Mechanical Engineer', label: 'Mechanical Engineer', color: 'text-orange-600',  border: 'border-orange-100',  bg: 'bg-orange-50',  dot: 'bg-orange-500' },
        ];
        const savedDocs = docs.filter((d: any) => !!deliverables[d.doc_id]);
        if (savedDocs.length === 0) return null;
        return (
          <section className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="font-bold text-slate-900">Project Files</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{savedDocs.length} generated deliverable{savedDocs.length !== 1 ? 's' : ''} · click to open</p>
            </div>
            <div className="divide-y divide-slate-50">
              {ROLE_GROUPS.map(group => {
                const groupDocs = savedDocs.filter((d: any) => d.assigned_to === group.key);
                if (groupDocs.length === 0) return null;
                return (
                  <div key={group.key} className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2 h-2 rounded-full ${group.dot}`} />
                      <p className={`text-[10px] font-mono font-bold uppercase tracking-widest ${group.color}`}>{group.label}</p>
                      <span className="text-[10px] font-mono text-slate-300">{groupDocs.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {groupDocs.map((doc: any) => {
                        const entry  = docStatusMap[doc.doc_id];
                        const status = entry?.status ?? 'pending';
                        const STATUS_CFG: Record<string, { label: string; cls: string }> = {
                          pending:      { label: 'Pending',    cls: 'bg-slate-100 text-slate-500' },
                          in_progress:  { label: 'In Progress',cls: 'bg-blue-100 text-blue-600' },
                          under_review: { label: 'Review',     cls: 'bg-amber-100 text-amber-600' },
                          approved:     { label: 'Approved',   cls: 'bg-emerald-100 text-emerald-700' },
                        };
                        const scfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
                        const isCalc = (() => { try { const p = JSON.parse(deliverables[doc.doc_id]); return p._type === 'calc_sheet'; } catch { return false; } })();
                        return (
                          <button
                            key={doc.doc_id}
                            onClick={() => onViewDocument(doc.doc_id)}
                            className={`text-left flex items-start gap-3 p-3 rounded-xl border ${group.border} ${group.bg} hover:shadow-sm transition-all group`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {isCalc
                                ? <FileText className={`w-4 h-4 ${group.color}`} />
                                : <FileText className={`w-4 h-4 ${group.color}`} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 font-mono truncate">{doc.doc_id}</p>
                              <p className="text-[11px] text-slate-500 truncate leading-snug mt-0.5">{doc.title}</p>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                {isCalc && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono bg-white/70 text-slate-500 border border-slate-200">CALC</span>
                                )}
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
          </section>
        );
      })()}

    </motion.div>
  );
};

// ─── SSE helper for POST requests ──────────────────────────────────────────

interface ThinkingStep {
  step: number;
  title: string;
  status: 'running' | 'done';
  data?: Record<string, any>;
}

async function streamPmAgent(
  url: string,
  body: Record<string, any>,
  onStep: (step: ThinkingStep) => void,
): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.body) throw new Error('No response stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalResult: any = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const lines = part.split('\n');
      let eventType = '';
      let data = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) eventType = line.slice(7);
        else if (line.startsWith('data: ')) data = line.slice(6);
      }
      if (!eventType || !data) continue;

      if (eventType === 'progress') {
        try { onStep(JSON.parse(data)); } catch {}
      } else if (eventType === 'result') {
        finalResult = JSON.parse(data);
      } else if (eventType === 'error') {
        const err = JSON.parse(data);
        throw new Error(err.error || 'Agent failed');
      }
    }
  }

  if (!finalResult) throw new Error('No result received from agent');
  return finalResult;
}

// ─── Thinking Panel (shown during PM agent execution) ──────────────────────

const STEP_LABELS: Record<number, { label: string; icon: React.ReactNode }> = {
  0: { label: 'Loading catalog',               icon: <FileText className="w-3.5 h-3.5" /> },
  1: { label: 'Analysing SOW',                 icon: <FileText className="w-3.5 h-3.5" /> },
  2: { label: 'Matching project type',          icon: <Briefcase className="w-3.5 h-3.5" /> },
  3: { label: 'Evaluating risk flags (RAG)',    icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  4: { label: 'Building document register',     icon: <FileText className="w-3.5 h-3.5" /> },
  5: { label: 'Building task assignments',      icon: <Users className="w-3.5 h-3.5" /> },
  6: { label: 'Generating handoff brief',       icon: <FileText className="w-3.5 h-3.5" /> },
};

const ThinkingPanel: React.FC<{ steps: ThinkingStep[] }> = ({ steps }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: panelRef.current.scrollHeight, behavior: 'smooth' });
  }, [steps.length]);

  const latestByStep = new Map<number, ThinkingStep>();
  for (const s of steps) latestByStep.set(s.step, s);
  const ordered = [...latestByStep.values()].sort((a, b) => a.step - b.step);

  return (
    <div ref={panelRef} className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
      {ordered.map(s => {
        const cfg = STEP_LABELS[s.step] ?? { label: s.title, icon: <Circle className="w-3.5 h-3.5" /> };
        const isDone = s.status === 'done';
        return (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-xl border px-4 py-3 transition-all ${
              isDone ? 'bg-white border-slate-100' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1">
              {isDone
                ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                : <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />}
              <span className={`text-xs font-bold ${isDone ? 'text-slate-700' : 'text-blue-700'}`}>
                {s.title}
              </span>
            </div>

            {isDone && s.data && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="ml-6.5 mt-1.5 space-y-1"
              >
                {Object.entries(s.data).map(([key, val]) => {
                  if (key === 'docs' && Array.isArray(val)) {
                    return (
                      <div key={key} className="mt-1">
                        <p className="text-[10px] font-mono text-slate-400 uppercase mb-1">{val.length} deliverables</p>
                        {val.slice(0, 5).map((d: any) => (
                          <div key={d.doc_id} className="flex items-center gap-2 text-[11px] text-slate-600 py-0.5">
                            <span className="font-mono text-blue-600 shrink-0">{d.doc_id}</span>
                            <span className="truncate">{d.title}</span>
                          </div>
                        ))}
                        {val.length > 5 && (
                          <p className="text-[10px] text-slate-400 mt-0.5">+ {val.length - 5} more</p>
                        )}
                      </div>
                    );
                  }
                  if (key === 'flags_fired' && Array.isArray(val)) {
                    return val.length > 0 ? (
                      <div key={key} className="flex flex-wrap gap-1.5 mt-1">
                        {val.map((f: any) => <RiskBadge key={f.condition} condition={f.condition} />)}
                      </div>
                    ) : (
                      <p key={key} className="text-[11px] text-emerald-600">No risk flags triggered</p>
                    );
                  }
                  if (val == null || val === '') return null;
                  if (Array.isArray(val)) {
                    return (
                      <div key={key} className="text-[11px] text-slate-600">
                        <span className="text-slate-400 font-mono mr-1">{key}:</span>
                        {val.join(', ')}
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="text-[11px] text-slate-600">
                      <span className="text-slate-400 font-mono mr-1">{key}:</span>
                      {String(val)}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── Calc Sheet View ───────────────────────────────────────────────────────

function tryParseCalcSheet(content: string): any | null {
  try {
    const parsed = JSON.parse(content);
    return parsed._type === 'calc_sheet' ? parsed : null;
  } catch { return null; }
}

// Row format: [label, field, sourceField | null, unit?, formula?]
const CALC_SECTIONS = [
  {
    key: 'fluid_properties',
    title: 'Fluid Properties',
    color: 'text-blue-600',
    rows: [
      ['Fluid Code',       'fluid_code',             'fluid_code_source', null,    'RAG lookup against 1-LST-0002 fluid list using the project fluid description'],
      ['Density',          'density_kgm3',           null,                'kg/m³', 'Retrieved from fluid database for the identified fluid code at operating temperature'],
      ['Specific Gravity', 'specific_gravity',       null,                null,    'SG = ρ_fluid / ρ_water = ρ / 1000'],
      ['Viscosity',        'dynamic_viscosity_mPas', null,                'mPa·s', 'Retrieved from fluid database for fluid code at operating temperature'],
      ['Vapor Pressure',   'vapor_pressure_kPa',     null,                'kPa',   'Retrieved from fluid database at operating temperature'],
      ['Corrosive',        'corrosive',              null,                null,    'Determined from fluid code classification in 1-LST-0002'],
    ],
  },
  {
    key: 'design_criteria',
    title: 'Design Criteria',
    color: 'text-emerald-600',
    rows: [
      ['Normal Flow',         'normal_flow_m3h',        null, 'm³/h', 'Taken directly from project scope / process datasheet'],
      ['Flow Margin',         'flow_margin_pct',        null, '%',     'Per 1-PRC-0001: 10% for normal service, 15% for intermittent'],
      ['Rated Flow',          'rated_flow_m3h',         null, 'm³/h', 'Q_rated = Q_normal × (1 + margin / 100)'],
      ['Pressure Class',      'pressure_class',         null, null,    'Per ASME B16.5 based on design pressure and temperature rating'],
      ['Corrosion Allowance', 'corrosion_allowance_mm', null, 'mm',   'Per 1-PRC-0001 material selection table for the service fluid'],
      ['Material Note',       'material_note',          null, null,    'Selected based on fluid corrosivity, temperature and pressure class'],
    ],
  },
  {
    key: 'hydraulic_results',
    title: 'Hydraulic Results',
    color: 'text-orange-600',
    rows: [
      ['Total Dynamic Head', 'tdh_display',   null, null,  'TDH = ΔZ + (P_d − P_s)/ρg + h_f_total  [m]  where ΔZ = static head, h_f = friction losses'],
      ['NPSHa',              'NPSHa_m',       null, 'm',   'NPSHa = (P_atm + P_s)/ρg + Z_s − h_f_s − P_v/ρg  [m]'],
      ['Static Head',        'static_head_m', null, 'm',   'ΔZ = Z_discharge − Z_suction  [m]'],
      ['Friction Loss',      'friction_loss_m', null, null, 'h_f = h_f_suction + h_f_discharge  (from project piping data)'],
      ['Rated Flow',         'rated_flow_m3h', null, 'm³/h', 'Carried forward from Design Criteria step'],
    ],
  },
];

const PUMP_CALC_SECTIONS = [
  {
    key: 'inputs',
    title: 'INPUT',
    color: 'text-blue-600',
    rows: [
      ['Fluid Density (ρ)',         'fluid_density_kgm3',        null, 'kg/m³', 'From process fluid properties output (Step 1 of process calc)'],
      ['Operating Temperature',     'temperature_c',             null, '°C',    'From project scope / process datasheet'],
      ['Vapor Pressure',            'vapor_pressure_kPa',        null, 'kPa',   'From fluid database at operating temperature'],
      ['Suction Vessel Pressure',   'suction_pressure_barg',     null, 'barg',  'From process P&ID / equipment datasheet'],
      ['Discharge Vessel Pressure', 'discharge_pressure_barg',   null, 'barg',  'From process P&ID / equipment datasheet'],
      ['Rated Flow',                'rated_flow_m3h',            null, 'm³/h',  'Q_rated from process design criteria (includes flow margin)'],
      ['Suction Static Head',       'suction_static_head_m',     null, 'm',     'Elevation of suction vessel liquid level above pump centreline'],
      ['Discharge Static Head',     'discharge_static_head_m',   null, 'm',     'Elevation of discharge vessel inlet above pump centreline'],
      ['Suction Friction Loss',     'suction_friction_loss_m',   null, 'm',     'Pipe friction losses in suction line (from piping isometric / preliminary calc)'],
      ['Discharge Friction Loss',   'discharge_friction_loss_m', null, 'm',     'Pipe friction losses in discharge line (from piping isometric / preliminary calc)'],
    ],
  },
  {
    key: 'calculated',
    title: 'CALC',
    color: 'text-emerald-600',
    rows: [
      ['Total Suction Head',   'total_suction_head_m',   null, 'm',    'H_s = Z_s + P_s/(ρg) − h_f_s  [m]  (pressure converted: 1 barg ≈ 10.2 m H₂O at ρ=1000)'],
      ['Total Discharge Head', 'total_discharge_head_m', null, 'm',    'H_d = Z_d + P_d/(ρg) + h_f_d  [m]'],
      ['Differential Head',    'total_dynamic_head_m',   null, 'm',    'TDH = H_d − H_s  [m]  (the head the pump must develop)'],
      ['Hydraulic Power',      'hydraulic_power_kW',     null, 'kW',   'P_hyd = ρ × g × Q × TDH / 3 600 000  [kW]  (Q in m³/h)'],
      ['Specific Speed (Ns)',  'specific_speed_Ns',      null, null,   'Ns = N√Q / TDH^0.75  (API 610 definition; N in rpm, Q in m³/h)'],
      ['Impeller Type',        'impeller_type',          null, null,   'Ns < 500 → radial flow · 500–3000 → mixed flow · > 3000 → axial flow'],
      ['NPSHa',                'NPSHa_m',                null, 'm',    'NPSHa = (P_atm + P_s)/ρg + Z_s − h_f_s − P_v/ρg  [m]  (P_atm ≈ 10.33 m H₂O)'],
      ['NPSHr (estimated)',    'NPSHr_estimated_m',      null, 'm',    'NPSHr ≈ TDH × 0.08 to 0.15 (estimated; must be confirmed by pump vendor)'],
      ['NPSH Margin',          'npsh_margin_m',          null, 'm',    'Margin = NPSHa − NPSHr  [m]  (API 610 requires minimum 0.6 m margin)'],
      ['NPSH Status',          'npsh_status',            null, null,   'PASS if NPSHa > NPSHr + 0.6 m · FAIL if margin is insufficient'],
    ],
  },
  {
    key: 'outputs',
    title: 'OUTPUT',
    color: 'text-orange-600',
    rows: [
      ['Estimated Efficiency', 'assumed_efficiency',  null, '%',   'η estimated from specific speed Ns using Hydraulic Institute pump efficiency charts'],
      ['BHP (Shaft Power)',    'shaft_power_kW',      null, 'kW',  'BHP = P_hyd / η  [kW]  (brake horsepower = hydraulic power / pump efficiency)'],
      ['API 610 Motor Margin', 'api610_motor_margin', null, '%',   'Per API 610 Table 1: min 10% for BHP < 22 kW · 10% for 22–55 kW · 5% for > 55 kW'],
      ['Required Motor Rating','required_motor_kW',   null, 'kW',  'P_motor = BHP × (1 + margin/100), rounded up to next standard IEC/NEMA motor frame size'],
      ['Pump Speed',           'pump_speed_rpm',      null, 'rpm', 'Design assumption: 1450 rpm (2-pole 50 Hz) or 2900 rpm; confirmed by vendor selection'],
      ['Specific Gravity',     'specific_gravity',    null, null,  'SG = ρ_fluid / 1000  (relative to water at 15°C)'],
    ],
  },
];

function CalcSectionTable({ sections, data }: { sections: typeof CALC_SECTIONS | typeof PUMP_CALC_SECTIONS, data: any }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      {sections.map(section => {
        const sectionData = (data as any)[section.key] ?? {};
        return (
          <div key={section.key} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className={`text-[10px] font-mono font-bold uppercase tracking-widest ${section.color}`}>{section.title}</p>
            </div>
            <table className="w-full">
              <tbody>
                {section.rows.map(([label, field, sourceField, unit, formula]) => {
                  const raw = sectionData[field as string];
                  if (raw == null) return null;
                  const display = typeof raw === 'boolean'
                    ? (raw ? 'Yes' : 'No')
                    : `${raw}${unit ? ' ' + unit : ''}`;
                  const source  = sourceField ? sectionData[sourceField as string] : null;
                  const rowKey  = `${section.key}.${field}`;
                  const isOpen  = !!expanded[rowKey];
                  return (
                    <React.Fragment key={field as string}>
                      <tr
                        className={`border-b border-slate-50 last:border-0 ${formula ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/60'}`}
                        onClick={() => formula && toggle(rowKey)}
                      >
                        <td className="px-4 py-2 text-xs text-slate-500 w-44">
                          <span className="flex items-center gap-1.5">
                            {formula && (
                              isOpen
                                ? <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                                : <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                            )}
                            {label}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs font-semibold text-slate-900">{display}</td>
                        {source && <td className="px-4 py-2 text-[11px] text-slate-400 font-mono">{source}</td>}
                      </tr>
                      {isOpen && formula && (
                        <tr className="bg-blue-50/50 border-b border-slate-50">
                          <td colSpan={3} className="px-10 py-2.5 text-[11px] text-blue-800 font-mono leading-relaxed">
                            {formula as string}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}

const CalcSheetView: React.FC<{ data: any }> = ({ data }) => (
  <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
    {data._subtype === 'pump_calc'
      ? <CalcSectionTable sections={PUMP_CALC_SECTIONS} data={data} />
      : <CalcSectionTable sections={CALC_SECTIONS} data={data} />
    }

    {(data.calc_summary || data.calculation_notes) && (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-2 border-b border-slate-100">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Calculation Notes</p>
        </div>
        <div className="px-4 py-3 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
          {data.calc_summary || data.calculation_notes}
        </div>
      </div>
    )}

    <p className="text-[10px] text-slate-300 font-mono text-center pb-2">
      Generated {data.generated_at ? new Date(data.generated_at).toLocaleString() : ''}
      {' · '}Future: Export to Excel
    </p>
  </div>
);


// ─── Deliverable Document Modal ────────────────────────────────────────────

// ── Session helpers ────────────────────────────────────────────────────────

function extractSessionContent(fullContent: string, headings: string[]): string {
  if (!headings || headings.length === 0) return fullContent;
  const normHeadings = headings.map(h => h.replace(/^#+\s*/, '').trim().toLowerCase());
  const lines = fullContent.split('\n');
  const result: string[] = [];
  let inSection = false;
  let sectionLevel = 0;
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.*)/);
    if (m) {
      const lvl = m[1].length;
      const lineText = m[2].trim().toLowerCase();
      const isTarget = normHeadings.some(h => lineText === h || lineText.startsWith(h.substring(0, 30)) || h.startsWith(lineText.substring(0, 30)));
      if (isTarget) { inSection = true; sectionLevel = lvl; result.push(line); }
      else if (inSection && lvl <= sectionLevel) { inSection = false; }
      else if (inSection) { result.push(line); }
    } else if (inSection) { result.push(line); }
  }
  return result.join('\n').trim();
}

const DeliverableModal: React.FC<{
  doc: any;
  initialContent: string;
  masterContent?: string;  // full master document (for merge-to-master)
  projectId: string;
  projectContext: any;
  onClose: () => void;
  onSave: (content: string) => void;
  onMergeToMaster?: (sessionContent: string) => void;  // PM merges session back into master
  readOnly?: boolean;
  session?: any;  // session object (for session mode)
  userRole?: Role;
}> = ({ doc, initialContent, masterContent, projectId, onClose, onSave, onMergeToMaster, readOnly = false, session, userRole }) => {
  const calcSheet   = tryParseCalcSheet(initialContent);
  const isCalcSheet = !!calcSheet;
  const notesKey    = calcSheet?._subtype === 'pump_calc' ? 'calculation_notes' : 'calc_summary';
  const [content,     setContent]     = useState(initialContent);
  const [calcNotes,   setCalcNotes]   = useState<string>(isCalcSheet ? (calcSheet[notesKey] ?? '') : '');
  const [messages,    setMessages]    = useState<{ role: 'user' | 'ai'; text: string; revisedContent?: string }[]>([]);
  const [input,       setInput]       = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [saveState,   setSaveState]   = useState<'idle' | 'saving' | 'saved'>('idle');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // In session mode, display session content; in master mode, display full doc
  const isSessionMode = !!session;
  const effectiveReadOnly = readOnly;
  const canMerge = isSessionMode && userRole === 'pm' && session?.owner !== 'pm' && !!onMergeToMaster;

  // Word preview — available for PM, Process Engineer, and Mechanical Engineer text docs (not calc sheets)
  const isTextDoc = !isCalcSheet && (doc.assigned_to === 'PM' || doc.assigned_to === 'Process Engineer' || doc.assigned_to === 'Mechanical Engineer');
  const isPmDoc   = isTextDoc; // kept as alias used throughout
  const [viewMode,     setViewMode]     = useState<'markdown' | 'word'>('markdown');
  const [wordHtml,     setWordHtml]     = useState<string>('');
  const [wordLoading,  setWordLoading]  = useState(false);
  const [wordError,    setWordError]    = useState('');

  const docxUrlBase = doc.assigned_to === 'Process Engineer'
    ? '/files/process-deliverables'
    : doc.assigned_to === 'Mechanical Engineer'
    ? '/files/mechanical-deliverables'
    : '/files/pm-deliverables';

  const loadWordPreview = async () => {
    if (wordHtml) { setViewMode('word'); return; }
    setWordLoading(true);
    setWordError('');
    try {
      const safeId = doc.doc_id.replace(/\//g, '_').replace(/\./g, '_');
      let res = await fetch(`${docxUrlBase}/${safeId}.docx`);
      // For summaries: auto-generate docx if not yet created
      if (!res.ok && doc.doc_id.startsWith('summary_v')) {
        const version = parseInt(doc.doc_id.replace('summary_v', ''));
        await fetch(`/api/projects/${projectId}/export-summary-docx`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version, content }),
        });
        res = await fetch(`${docxUrlBase}/${safeId}.docx`);
      }
      if (!res.ok) throw new Error(`File not found (${res.status})`);
      const buf = await res.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer: buf });
      setWordHtml(result.value);
      setViewMode('word');
    } catch (e: any) {
      setWordError(e.message || 'Failed to load Word preview');
    } finally {
      setWordLoading(false);
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSave = async () => {
    const saveContent = (isCalcSheet && !effectiveReadOnly)
      ? JSON.stringify({ ...calcSheet, [notesKey]: calcNotes }, null, 2)
      : content;
    setSaveState('saving');
    onSave(saveContent);
    try {
      if (doc.doc_id.startsWith('summary_v')) {
        // Summary save — update the summary entry, then regenerate docx
        const version = parseInt(doc.doc_id.replace('summary_v', ''));
        await fetch(`/api/projects/${projectId}/update-summary`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version, content: saveContent }),
        });
        await fetch(`/api/projects/${projectId}/export-summary-docx`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version, content: saveContent }),
        });
        setWordHtml('');
      } else if (isSessionMode && session) {
        // Save to session content (not master) — engineer or PM editing a session slice
        await fetch(`/api/projects/${projectId}/session-content`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ docId: doc.doc_id, sessionId: session.id, content: saveContent }),
        });
      } else {
        // Save to master deliverable
        await fetch(`/api/projects/${projectId}/deliverable`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ docId: doc.doc_id, content: saveContent }),
        });
        if (isPmDoc) {
          await fetch(`/api/projects/${projectId}/export-docx`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ docId: doc.doc_id, content: saveContent }),
          });
          setWordHtml('');
        }
      }
    } catch (e) { console.error(e); }
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 2500);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || chatLoading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setChatLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/deliverable-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: doc.doc_id, message: text, content, history: messages }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply, revisedContent: data.revisedContent }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: `Error: ${data.error}` }]);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'ai', text: `Request failed: ${e.message}` }]);
    } finally { setChatLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col"
        style={{ height: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">{doc.doc_id} — {doc.title}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {isCalcSheet && !effectiveReadOnly ? 'Structured calc sheet · Edit notes below · Chat with AI'
                : isCalcSheet ? 'Structured calculation sheet · Read only'
                : effectiveReadOnly ? 'Read only'
                : 'Edit directly · or chat with AI for revisions'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {effectiveReadOnly
              ? <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">{isCalcSheet ? 'Calc Sheet' : 'Read Only'}</span>
              : (
                <button
                  onClick={handleSave}
                  disabled={saveState === 'saving'}
                  className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${
                    saveState === 'saved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60'
                  }`}
                >
                  {saveState === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {saveState === 'saved' ? '✓ Saved' : 'Save Changes'}
                </button>
              )
            }
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Session banner */}
        {isSessionMode && (
          <div className={`px-6 py-2 border-b shrink-0 flex items-center justify-between gap-4 ${canMerge ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono uppercase tracking-wider ${canMerge ? 'text-amber-500' : 'text-blue-500'}`}>
                {canMerge ? 'PM Review — Engineer Section' : 'Your Section'}
              </span>
              <span className={`text-xs font-semibold ${canMerge ? 'text-amber-700' : 'text-blue-700'}`}>{session.title}</span>
              {session.lastEditedAt && (
                <span className="text-[9px] text-slate-400 font-mono">
                  · last edited {new Date(session.lastEditedAt).toLocaleString()}
                </span>
              )}
            </div>
            {canMerge && (
              <button
                onClick={() => onMergeToMaster?.(content)}
                className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors shrink-0"
              >
                Merge to Master →
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left — Calc sheet, document viewer, or markdown editor */}
          <div className={`flex-1 flex flex-col overflow-hidden ${effectiveReadOnly ? '' : 'border-r border-slate-100'}`}>
            {isCalcSheet ? (
              <>
                <CalcSheetView data={calcSheet} />
                <div className="border-t border-slate-100 shrink-0 p-4 bg-white">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">Calculation Notes</p>
                  <textarea
                    value={calcNotes}
                    onChange={e => !effectiveReadOnly && setCalcNotes(e.target.value)}
                    readOnly={effectiveReadOnly}
                    rows={3}
                    className={`w-full text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 resize-none outline-none focus:ring-1 focus:ring-blue-400 ${effectiveReadOnly ? 'cursor-default' : ''}`}
                    placeholder="Add notes, assumptions, or commentary…"
                    spellCheck={false}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 shrink-0 flex items-center justify-between">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {viewMode === 'word' ? 'Word Preview' : (effectiveReadOnly ? 'Document Viewer' : 'Markdown Editor')}
                  </p>
                  <div className="flex items-center gap-1">
                    {isPmDoc && (
                      <>
                        <button
                          onClick={() => setViewMode('markdown')}
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${viewMode === 'markdown' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                          Markdown
                        </button>
                        <button
                          onClick={loadWordPreview}
                          disabled={wordLoading}
                          className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${viewMode === 'word' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                          {wordLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                          Word Preview
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {viewMode === 'word' ? (
                  <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {wordError ? (
                      <p className="text-xs text-red-500 font-mono">{wordError}</p>
                    ) : (
                      <div
                        className="text-sm text-slate-800 leading-relaxed
                          [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-2
                          [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-4
                          [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3
                          [&_p]:mb-3
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
                          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
                          [&_li]:mb-1
                          [&_table]:border-collapse [&_table]:w-full [&_table]:mb-4 [&_table]:text-xs
                          [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2
                          [&_th]:border [&_th]:border-slate-200 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-slate-50 [&_th]:font-semibold [&_th]:text-left"
                        dangerouslySetInnerHTML={{ __html: wordHtml }}
                      />
                    )}
                  </div>
                ) : (
                  <textarea
                    value={content}
                    onChange={e => {
                      if (!effectiveReadOnly) setContent(e.target.value);
                    }}
                    readOnly={effectiveReadOnly}
                    className={`flex-1 p-5 font-mono text-xs text-slate-700 resize-none outline-none leading-relaxed ${effectiveReadOnly ? 'bg-slate-50 cursor-default select-text' : ''}`}
                    spellCheck={false}
                  />
                )}
              </>
            )}
          </div>

          {/* Right — AI Chat (hidden in effectiveReadOnly mode) */}
          {!effectiveReadOnly && <div className="w-96 flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 shrink-0 flex items-center gap-2">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">AI Assistant</p>
              <span className="text-[9px] font-mono text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Document loaded as context</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <MessageCircle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-xs font-semibold text-slate-400">Chat with AI about this document</p>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed px-4">
                    {isCalcSheet
                      ? 'Ask about assumptions, flag concerns, or request a revised narrative for the notes section.'
                      : 'Ask it to revise a section, add content, adjust the tone, or answer questions.'}
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`text-xs px-3 py-2.5 rounded-xl max-w-[92%] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.revisedContent && (
                    <button
                      onClick={() => {
                        if (isCalcSheet) {
                          setCalcNotes(msg.revisedContent!);
                        } else {
                          setContent(msg.revisedContent!);
                          setViewMode('markdown'); // switch to markdown so the change is visible
                        }
                      }}
                      className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" /> {isCalcSheet ? 'Apply to notes' : 'Apply revision to editor'}
                    </button>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-start">
                  <div className="bg-slate-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
                    <span className="text-xs text-slate-400">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-100 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask AI to revise…"
                  disabled={chatLoading}
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || chatLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>}

        </div>
      </motion.div>
    </div>
  );
};


// ─── Process Steps Panel ───────────────────────────────────────────────────

const PROCESS_STEP_DEFS = [
  { num: 1, label: 'Fluid Properties',       method: 'Knowledge base lookup', desc: 'Fluid code and physical properties from 1-LST-0002.' },
  { num: 2, label: 'Design Criteria',        method: 'Knowledge base lookup', desc: 'Flow margin, pressure class, corrosion allowance from 1-PRC-0001.' },
  { num: 3, label: 'Hydraulic Calculations', method: 'Engineering calculations', desc: 'TDH and NPSHa from project parameters.' },
  { num: 4, label: 'Calculation Summary',    method: 'Auto-generated narrative', desc: 'Professional calculation summary document.' },
];

const StepResultPreview: React.FC<{ stepNum: number; result: any }> = ({ stepNum, result }) => {
  if (!result) return null;
  const row = (label: string, val: any) => val != null
    ? <span key={label} className="mr-4"><span className="text-slate-400 font-mono">{label}:</span> <span className="text-slate-700 font-semibold">{String(val)}</span></span>
    : null;
  if (stepNum === 1) return (
    <div className="mt-2 ml-10 text-[11px] bg-slate-50 rounded-lg px-3 py-2 flex flex-wrap gap-y-0.5">
      {row('Code', result.fluid_code)}{row('Density', result.density_kgm3 ? `${result.density_kgm3} kg/m³` : null)}{row('Corrosive', result.corrosive ? 'Yes' : 'No')}
    </div>
  );
  if (stepNum === 2) return (
    <div className="mt-2 ml-10 text-[11px] bg-slate-50 rounded-lg px-3 py-2 flex flex-wrap gap-y-0.5">
      {row('Margin', result.flow_margin_pct ? `${result.flow_margin_pct}%` : null)}{row('Rated flow', result.rated_flow_m3h ? `${result.rated_flow_m3h} m³/h` : null)}{row('Pressure class', result.pressure_class)}{row('Corr. allow.', result.corrosion_allowance_mm ? `${result.corrosion_allowance_mm} mm` : null)}
    </div>
  );
  if (stepNum === 3) return (
    <div className="mt-2 ml-10 text-[11px] bg-slate-50 rounded-lg px-3 py-2 flex flex-wrap gap-y-0.5">
      {row('TDH', result.tdh_display ?? (result.total_dynamic_head_m ? `${result.total_dynamic_head_m} m` : null))}{row('NPSHa', result.NPSHa_m ? `${result.NPSHa_m} m` : null)}
    </div>
  );
  if (stepNum === 4) return (
    <div className="mt-2 ml-10 text-[11px] bg-slate-50 rounded-lg px-3 py-2 text-slate-500 leading-relaxed line-clamp-2">
      {typeof result === 'string' ? result.slice(0, 220) + (result.length > 220 ? '…' : '') : 'Summary generated.'}
    </div>
  );
  return null;
};

const ProcessStepsPanel: React.FC<{
  processSteps: Record<string, any>;
  onRunStep: (step: number) => void;
  onRunAll: () => void;
  stepRunning: number | null;
  allRunning: boolean;
  stepProgress: Record<number, 'running' | 'done'>;
  error: string;
}> = ({ processSteps, onRunStep, onRunAll, stepRunning, allRunning, stepProgress, error }) => {
  const anyBusy = allRunning || stepRunning !== null;

  return (
    <section className="bg-white rounded-2xl shadow-soft overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <p className="font-bold text-slate-900">Process Calculations</p>
          <p className="text-xs text-slate-400 font-mono">Run steps individually · or click Run All for the full pipeline</p>
        </div>
        <button
          onClick={onRunAll}
          disabled={anyBusy}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shrink-0"
        >
          {allRunning
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running…</>
            : <><Play className="w-3.5 h-3.5" /> Run All</>}
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {PROCESS_STEP_DEFS.map(def => {
          const stored   = processSteps[`step${def.num}`];
          const isDone   = stored?.status === 'done';
          const isThisRunning = stepRunning === def.num || (allRunning && stepProgress[def.num] === 'running');
          const allDone_this  = allRunning && stepProgress[def.num] === 'done';
          const prevKey  = `step${def.num - 1}`;
          const prevDone = def.num === 1 || !!processSteps[prevKey];
          const canRun   = prevDone && !anyBusy;

          return (
            <div key={def.num} className={`px-6 py-4 transition-colors ${isThisRunning || allDone_this ? 'bg-emerald-50/60' : ''}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    isDone || allDone_this ? 'bg-emerald-100 text-emerald-700' :
                    isThisRunning         ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-500'
                  }`}>
                    {isDone || allDone_this ? '✓' :
                     isThisRunning ? <Loader2 className="w-3 h-3 animate-spin" /> :
                     def.num}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{def.label}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{def.method}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRunStep(def.num)}
                  disabled={!canRun}
                  className={`shrink-0 flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    isThisRunning ? 'bg-blue-100 text-blue-700' :
                    isDone        ? 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700' :
                    canRun        ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                    'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  {isThisRunning ? <><Loader2 className="w-3 h-3 animate-spin" /> Running…</> :
                   isDone        ? 'Re-run' :
                                   <><Play className="w-3 h-3" /> Run</>}
                </button>
              </div>
              {isDone && <StepResultPreview stepNum={def.num} result={stored.result} />}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-100 text-xs text-red-600">{error}</div>
      )}
    </section>
  );
};


// ─── Pump Calc Panel ───────────────────────────────────────────────────────

const PumpCalcPanel: React.FC<{
  mechanicalOutput: any;
  onRun: () => void;
  running: boolean;
  error: string;
}> = ({ mechanicalOutput, onRun, running, error }) => {
  const done  = !!mechanicalOutput?.pump_calculations;
  const calcs = mechanicalOutput?.pump_calculations ?? {};

  return (
    <section className="bg-white rounded-2xl shadow-soft overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <p className="font-bold text-slate-900">Pump Calculations</p>
          <p className="text-xs text-slate-400 font-mono">Hydraulic sizing · API 610 motor margin · NPSH check</p>
        </div>
        <button
          onClick={onRun}
          disabled={running}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shrink-0"
        >
          {running
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running…</>
            : done
              ? <><Play className="w-3.5 h-3.5" /> Re-run</>
              : <><Play className="w-3.5 h-3.5" /> Run Calculation</>}
        </button>
      </div>

      {done && (
        <div className="px-6 py-4 grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs">
          {[
            ['Rated Flow',      calcs.rated_flow_m3h      != null ? `${calcs.rated_flow_m3h} m³/h`  : null],
            ['Diff. Head',      calcs.total_dynamic_head_m != null ? `${calcs.total_dynamic_head_m} m` : null],
            ['Hydraulic Power', calcs.hydraulic_power_kW  != null ? `${calcs.hydraulic_power_kW} kW`  : null],
            ['BHP',             calcs.shaft_power_kW      != null ? `${calcs.shaft_power_kW} kW`      : null],
            ['Motor (req.)',    calcs.required_motor_kW   != null ? `${calcs.required_motor_kW} kW`   : null],
            ['NPSH Status',     calcs.npsh_status                                                     ?? null],
            ['Impeller Type',   calcs.impeller_type                                                   ?? null],
            ['Motor Margin',    calcs.api610_motor_margin  != null ? `${calcs.api610_motor_margin}%`  : null],
          ].map(([label, val]) => val != null && (
            <div key={label as string} className="flex justify-between border-b border-slate-50 py-0.5">
              <span className="text-slate-400 font-mono">{label}</span>
              <span className="font-semibold text-slate-900">{val}</span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-100 text-xs text-red-600">{error}</div>
      )}
    </section>
  );
};


// ─── New Project Modal ─────────────────────────────────────────────────────

const NewProjectModal: React.FC<{
  onClose: () => void;
  onProjectCreated: (ctx: any) => void;
}> = ({ onClose, onProjectCreated }) => {
  const [file, setFile] = useState<File | null>(null);
  const [endDate, setEndDate] = useState('2026-08-01');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const runWithSSE = async (url: string, body: Record<string, any>) => {
    setLoading(true);
    setError('');
    setThinkingSteps([]);
    try {
      const data = await streamPmAgent(url, body, (step) => {
        setThinkingSteps(prev => [...prev, step]);
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!file) { setError('Please upload a SOW file (.docx) or use the demo.'); return; }
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const b64 = btoa(binary);
    await runWithSSE('/api/agents/pm', { sow_content_b64: b64, sow_filename: file.name, end_date: endDate });
  };

  const handleDemo = async () => {
    await runWithSSE('/api/agents/pm-demo', { end_date: endDate });
  };

  const summary = result?.project_summary;
  const flags   = result?.risk_flags_fired ?? [];
  const showThinking = loading || (thinkingSteps.length > 0 && !result);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        layout
        className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 ${
          showThinking ? 'max-w-3xl' : 'max-w-xl'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">New Project</h2>
            <p className="text-sm text-slate-500">
              {loading ? 'PM Agent is analysing your SOW…' : 'Upload a SOW to start the engineering workflow'}
            </p>
          </div>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!result && !showThinking ? (
            /* ── Upload form ── */
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">SOW Document</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">{file ? file.name : 'Click to upload .docx file'}</p>
                  <p className="text-xs text-slate-400 mt-1">Supports .docx format</p>
                  <input ref={fileRef} type="file" accept=".docx" className="hidden"
                    onChange={e => setFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={handleRun} disabled={!file || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  <Play className="w-4 h-4" /> Run PM Agent
                </button>
                <button onClick={handleDemo} disabled={loading}
                  className="px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold py-3 rounded-xl text-sm transition-colors">
                  Use Demo
                </button>
              </div>
              <p className="text-[11px] text-slate-400 text-center">Analysing scope and generating deliverables — ~30–60 seconds</p>
            </div>

          ) : showThinking ? (
            /* ── Thinking chain (live) ── */
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Daniel — PM Agent</p>
                  <p className="text-xs text-blue-600 font-mono">Thinking…</p>
                </div>
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin ml-auto" />
              </div>

              <ThinkingPanel steps={thinkingSteps} />

              {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
            </div>

          ) : (
            /* ── Result view ── */
            <div className="p-6 space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-800">Project Created</p>
                  <p className="text-sm text-emerald-700">{summary?.project_title}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Client', summary?.client],
                  ['Equipment', summary?.equipment_type],
                  ['Flow Rate', `${summary?.flow_rate_m3h} m³/h`],
                  ['Design P', `${summary?.design_pressure_bar} bar`],
                ].map(([label, val]) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[10px] font-mono text-slate-400 uppercase mb-1">{label}</p>
                    <p className="text-sm font-bold text-slate-900">{val}</p>
                  </div>
                ))}
              </div>
              {flags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Risk Flags</p>
                  <div className="flex flex-wrap gap-2">
                    {flags.map((f: any) => <RiskBadge key={f.condition} condition={f.condition} />)}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Suggested Team</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-emerald-50 rounded-lg p-3">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    <div><p className="text-sm font-bold">Aria</p><p className="text-xs text-slate-500">Process Engineer</p></div>
                  </div>
                  <div className="flex items-center gap-3 bg-orange-50 rounded-lg p-3">
                    <Wrench className="w-4 h-4 text-orange-600" />
                    <div><p className="text-sm font-bold">Hunter</p><p className="text-xs text-slate-500">Mechanical Engineer</p></div>
                  </div>
                </div>
              </div>
              {result.handoff_brief && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">Handoff Brief</p>
                  <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-mono border border-slate-100">
                    {result.handoff_brief}
                  </div>
                </div>
              )}
              <button onClick={() => onProjectCreated(result)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
                View Project Dashboard
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function projectAgentStatus(proj: any): AgentStatus {
  return {
    pm:         { project_context: !!proj.context,        handoff_brief:      !!proj.context?.handoff_brief },
    process:    { process_output:  !!proj.processOutput,  calc_summary:       !!proj.processOutput?.calc_summary },
    mechanical: { mechanical_output: !!proj.mechanicalOutput, pump_datasheet:  !!proj.mechanicalOutput?.pump_datasheet },
  };
}

// ─── Project List View ─────────────────────────────────────────────────────

const ProjectListView: React.FC<{
  user: User;
  projects: any[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
}> = ({ user, projects, onSelectProject, onNewProject }) => {
  const viewAs = user.role;
  const active    = projects.filter(p => p.status !== 'completed');
  const completed = projects.filter(p => p.status === 'completed');

  const renderGrid = (list: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {list.map(proj => (
        <ProjectCard
          key={proj.id}
          project={proj.context}
          status={projectAgentStatus(proj)}
          userRole={viewAs}
          docStatusMap={proj.docStatus ?? {}}
          onClick={() => onSelectProject(proj.id)}
        />
      ))}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {viewAs === 'pm' ? 'My Projects' : 'Assigned Projects'}
          </h1>
          <p className="text-slate-500 mt-1">
            {viewAs === 'pm' ? 'Projects you manage and oversee' :
             viewAs === 'process' ? 'Projects requiring process engineering' :
             'Projects requiring mechanical engineering'}
          </p>
        </div>
        {user.role === 'pm' && viewAs === 'pm' && (
          <button onClick={onNewProject}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-lg">
            <FileText className="w-4 h-4" /> New Project
          </button>
        )}
      </header>

      {/* Active */}
      <section>
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">
          Active Projects · {active.length}
        </p>
        {active.length > 0 ? renderGrid(active) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Briefcase className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No active projects</p>
            {user.role === 'pm' && viewAs === 'pm' && (
              <button onClick={onNewProject}
                className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                <FileText className="w-4 h-4" /> Start New Project
              </button>
            )}
          </div>
        )}
      </section>

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">
            Completed Projects · {completed.length}
          </p>
          {renderGrid(completed)}
        </section>
      )}
    </motion.div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────

export const Dashboard: React.FC<DashboardProps> = ({ user, isAdmin = false }) => {
  const viewAs = user.role;
  const [projects,       setProjects]       = useState<any[]>([]);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [showDetail,     setShowDetail]     = useState(false);
  const [loaded,         setLoaded]         = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [runningAgent,   setRunningAgent]   = useState<'process' | 'mechanical' | null>(null);
  const [agentError,     setAgentError]     = useState('');
  const [stepRunning,    setStepRunning]    = useState<number | null>(null);
  const [stepError,      setStepError]      = useState('');
  const [stepProgress,   setStepProgress]   = useState<Record<number, 'running' | 'done'>>({});
  const [docModal,       setDocModal]       = useState<{ docId: string; doc: any; readOnly?: boolean; session?: any; _content?: string } | null>(null);

  // Derived from selected project
  const selectedProject   = projects.find(p => p.id === selectedId) ?? null;
  const projectContext     = selectedProject?.context ?? null;
  const processOutput      = selectedProject?.processOutput ?? null;
  const mechanicalOutput   = selectedProject?.mechanicalOutput ?? null;
  const docStatusMap       = selectedProject?.docStatus ?? {};
  // deliverables values may be `true` (placeholder from list endpoint) or a string (full content from detail endpoint)
  const deliverables = Object.fromEntries(
    Object.entries(selectedProject?.context?.deliverables ?? {}).filter(([, v]) => typeof v === 'string')
  ) as Record<string, string>;
  const processSteps       = (selectedProject?.processSteps ?? {}) as Record<string, any>;
  const sessionsConfig     = (selectedProject?.sessionsConfig ?? {}) as Record<string, any[]>;
  const status: AgentStatus = selectedProject
    ? projectAgentStatus(selectedProject)
    : { pm: { project_context: false, handoff_brief: false }, process: { process_output: false, calc_summary: false }, mechanical: { mechanical_output: false, pump_datasheet: false } };

  const fetchAll = async () => {
    if (isAdmin) { setLoaded(true); return; }
    try {
      const arr = await fetch('/api/projects').then(r => r.json());
      setProjects(arr || []);
    } catch (e) { console.error('fetchAll failed', e); }
    finally { setLoaded(true); }
  };

  // When a project is selected, fetch its full data (including deliverable content)
  const fetchProjectDetail = async (id: string) => {
    try {
      const full = await fetch(`/api/projects/${id}`).then(r => r.json());
      setProjects(prev => prev.map(p => p.id === id ? full : p));
    } catch (e) { console.error('fetchProjectDetail failed', e); }
  };

  useEffect(() => { fetchAll(); }, []);

  // Load full detail whenever a project is selected
  useEffect(() => {
    if (selectedId) fetchProjectDetail(selectedId);
  }, [selectedId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const updateProject = (id: string, patch: (p: any) => any) =>
    setProjects(prev => prev.map(p => p.id === id ? patch(p) : p));

  const handlePublish = async () => {
    if (!selectedId) return;
    updateProject(selectedId, p => ({ ...p, docStatus: { ...p.docStatus, __project: { status: 'published', publishedAt: new Date().toISOString(), publishedBy: user.name } } }));
    await fetch(`/api/projects/${selectedId}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userName: user.name }) }).catch(console.error);
  };

  const handleMarkComplete = async () => {
    if (!selectedId) return;
    updateProject(selectedId, p => ({ ...p, status: 'completed' }));
    setShowDetail(false);
    setSelectedId(null);
    await fetch(`/api/projects/${selectedId}/complete`, { method: 'PUT' }).catch(console.error);
  };

  const handleBuildReference = async (): Promise<{ pages: number } | null> => {
    if (!selectedId) return null;
    try {
      const res = await fetch(`/api/projects/${selectedId}/build-reference`, { method: 'POST' });
      if (!res.ok) { console.error('build-reference failed', await res.text()); return null; }
      const data = await res.json();
      return { pages: data.pages ?? 0 };
    } catch (e) { console.error(e); return null; }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const idToDelete = selectedId;
    setProjects(prev => prev.filter(p => p.id !== idToDelete));
    setShowDetail(false);
    setSelectedId(null);
    await fetch(`/api/projects/${idToDelete}`, { method: 'DELETE' }).catch(console.error);
  };

  const handleReleaseSession = async (docId: string, sessionId: string, released: boolean) => {
    if (!selectedId) return;
    const current: any[] = sessionsConfig[docId] ?? [];
    const updated = current.map(s => s.id === sessionId ? { ...s, released } : s);
    updateProject(selectedId, p => ({
      ...p,
      sessionsConfig: { ...(p.sessionsConfig ?? {}), [docId]: updated },
    }));
    await fetch(`/api/projects/${selectedId}/sessions-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, sessions: updated }),
    }).catch(console.error);
  };

  const [suggestingSession, setSuggestingSession] = useState<string | null>(null);

  const handleSuggestSessions = async (docId: string, role?: string) => {
    if (!selectedId) return;
    setSuggestingSession(docId);
    try {
      const res = await fetch(`/api/projects/${selectedId}/suggest-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      updateProject(selectedId, p => ({
        ...p,
        sessionsConfig: { ...(p.sessionsConfig ?? {}), [docId]: data.sessions },
      }));
    } catch (e: any) { setAgentError(`Session generation failed: ${e.message}`); }
    finally { setSuggestingSession(null); }
  };

  const handleViewSummary = (entry: { version: number; content: string; createdAt: string }) => {
    setDocModal({
      docId: `summary_v${entry.version}`,
      doc: { doc_id: `summary_v${entry.version}`, title: `Deliverable Summary v${entry.version}`, assigned_to: 'PM' },
      _content: entry.content,
    });
  };

  const handleViewDocument = (docId: string, session?: any) => {
    if (!selectedProject) return;
    const doc = (selectedProject.context?.document_register ?? []).find((d: any) => d.doc_id === docId);
    if (!doc) return;
    const ownerRole: Record<string, Role> = { 'PM': 'pm', 'Process Engineer': 'process', 'Mechanical Engineer': 'mechanical' };
    if (session) {
      // Session mode: readOnly if user can't edit this session
      const canEdit = session.permissions?.edit?.includes(user.role) ?? false;
      setDocModal({ docId, doc, readOnly: !canEdit, session });
    } else {
      const readOnly = ownerRole[doc.assigned_to] !== user.role;
      setDocModal({ docId, doc, readOnly });
    }
  };

  const handleMergeToMaster = async (docId: string, session: any, sessionContent: string) => {
    if (!selectedId) return;
    const masterContent = deliverables[docId] ?? '';
    // Replace the corresponding section in master with the engineer's edited content
    const oldSlice = extractSessionContent(masterContent, session.headings ?? []);
    const newMaster = oldSlice ? masterContent.replace(oldSlice, sessionContent) : masterContent + '\n\n' + sessionContent;
    // Update local state
    updateProject(selectedId, p => ({
      ...p,
      context: { ...p.context, deliverables: { ...(p.context?.deliverables ?? {}), [docId]: newMaster } },
    }));
    // Persist to server
    await fetch(`/api/projects/${selectedId}/deliverable`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId, content: newMaster }),
    }).catch(console.error);
    setDocModal(null);
  };

  const runStep = async (stepNum: number) => {
    if (!selectedId) return;
    setStepRunning(stepNum); setStepError('');
    try {
      const res = await fetch(`/api/agents/process/step/${stepNum}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Step failed');
      updateProject(selectedId, p => {
        const newSteps = { ...(p.processSteps ?? {}), [`step${stepNum}`]: { status: 'done', result: data.result } };
        // If step 4 just finished and we have all prior steps, update deliverable locally too
        const newDeliverables = { ...(p.context?.deliverables ?? {}) };
        if (stepNum === 4 && newSteps.step1 && newSteps.step2 && newSteps.step3) {
          const calcDocId = (p.context?.document_register ?? []).find((d: any) =>
            d.assigned_to === 'Process Engineer' && d.doc_id?.includes('CAL')
          )?.doc_id || '1-CAL-XXXX';
          newDeliverables[calcDocId] = JSON.stringify({
            _type: 'calc_sheet',
            generated_at: new Date().toISOString(),
            fluid_properties:  newSteps.step1.result,
            design_criteria:   newSteps.step2.result,
            hydraulic_results: newSteps.step3.result,
            calc_summary:      newSteps.step4?.result ?? data.result,
          }, null, 2);
        }
        return { ...p, processSteps: newSteps, context: { ...p.context, deliverables: newDeliverables } };
      });
    } catch (e: any) { setStepError(e.message); }
    finally { setStepRunning(null); }
  };

  const handleDeliverableSave = (docId: string, content: string) => {
    if (!selectedId) return;
    updateProject(selectedId, p => ({
      ...p,
      context: { ...p.context, deliverables: { ...(p.context?.deliverables ?? {}), [docId]: content } },
    }));
  };

  const handleDocStatusChange = async (docId: string, newStatus: string) => {
    // Optimistic update first — always works regardless of server state
    const targetId = selectedId;
    updateProject(targetId ?? '', p => ({ ...p, docStatus: { ...p.docStatus, [docId]: { ...(p.docStatus[docId] ?? { comments: [] }), status: newStatus, lastUpdated: new Date().toISOString() } } }));
    if (!targetId) return;
    try {
      const res = await fetch(`/api/projects/${targetId}/doc-status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ docId, status: newStatus, userName: user.name, userRole: user.role }) });
      const updated = await res.json();
      if (res.ok) updateProject(targetId, p => ({ ...p, docStatus: { ...p.docStatus, [docId]: updated } }));
    } catch (e) { console.error('status change failed', e); }
  };

  const handleDocComment = async (docId: string, text: string) => {
    const targetId = selectedId;
    if (!targetId) return;
    try {
      const res = await fetch(`/api/projects/${targetId}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ docId, text, userName: user.name, userRole: user.role }) });
      const updated = await res.json();
      if (res.ok) updateProject(targetId, p => ({ ...p, docStatus: { ...p.docStatus, [docId]: updated } }));
    } catch (e) { console.error('comment failed', e); }
  };

  const runAgent = async (agentType?: 'process' | 'mechanical') => {
    if (!selectedId) return;
    const target = agentType ?? (user.role === 'process' ? 'process' : 'mechanical');
    setRunningAgent(target); setAgentError(''); setStepProgress({});

    if (target === 'process') {
      try {
        const result = await streamPmAgent('/api/agents/process', { projectId: selectedId }, (step) => {
          setStepProgress(prev => ({ ...prev, [step.step]: step.status as 'running' | 'done' }));
        });
        updateProject(selectedId, p => {
          const calcDocId = (p.context?.document_register ?? []).find((d: any) =>
            d.assigned_to === 'Process Engineer' && d.doc_id?.includes('CAL')
          )?.doc_id || '1-CAL-XXXX';
          return {
            ...p,
            processOutput: result,
            processSteps: {
              step1: { status: 'done', result: result.fluid_properties },
              step2: { status: 'done', result: result.design_criteria },
              step3: { status: 'done', result: result.hydraulic_results },
              step4: { status: 'done', result: result.calc_summary },
            },
            context: {
              ...p.context,
              deliverables: {
                ...(p.context?.deliverables ?? {}),
                [calcDocId]: JSON.stringify({
                  _type: 'calc_sheet',
                  generated_at: new Date().toISOString(),
                  fluid_properties:  result.fluid_properties,
                  design_criteria:   result.design_criteria,
                  hydraulic_results: result.hydraulic_results,
                  calc_summary:      result.calc_summary,
                }, null, 2),
              },
            },
          };
        });
      } catch (e: any) { setAgentError(e.message); }
      finally { setRunningAgent(null); }
      return;
    }

    // Mechanical agent (plain JSON response)
    try {
      const res = await fetch('/api/agents/mechanical', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId: selectedId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Agent failed');
      updateProject(selectedId, p => {
        const calcDocId  = data.pumpCalcDocId || '4-CAL-0001';
        const calcSheet  = data.pumpCalcSheet;
        const newDeliverables = calcSheet
          ? { ...(p.context?.deliverables ?? {}), [calcDocId]: JSON.stringify(calcSheet, null, 2) }
          : (p.context?.deliverables ?? {});
        return {
          ...p,
          mechanicalOutput: data,
          context: { ...p.context, deliverables: newDeliverables },
        };
      });
    } catch (e: any) { setAgentError(e.message); }
    finally { setRunningAgent(null); }
  };

  if (!loaded) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <>
      {/* Deliverable document modal */}
      {docModal && selectedId && (
        <DeliverableModal
          doc={docModal.doc}
          initialContent={
            docModal._content !== undefined
              ? docModal._content
              : docModal.session
                ? (docModal.session.content || extractSessionContent(deliverables[docModal.docId] ?? '', docModal.session.headings ?? []))
                : (deliverables[docModal.docId] ?? '')
          }
          masterContent={docModal._content !== undefined ? docModal._content : (deliverables[docModal.docId] ?? '')}
          projectId={selectedId}
          projectContext={projectContext}
          readOnly={docModal.readOnly}
          session={docModal.session}
          userRole={user.role}
          onClose={() => setDocModal(null)}
          onSave={(content) => {
            if (docModal.docId.startsWith('summary_v')) {
              // Update summary content in local projects state
              const version = parseInt(docModal.docId.replace('summary_v', ''));
              if (selectedId) {
                updateProject(selectedId, p => ({
                  ...p,
                  context: {
                    ...p.context,
                    deliverable_summaries: (p.context?.deliverable_summaries ?? []).map((s: any) =>
                      s.version === version ? { ...s, content } : s
                    ),
                  },
                }));
              }
            } else if (!docModal.session) {
              handleDeliverableSave(docModal.docId, content);
            } else {
              // Update session.content in local state
              if (selectedId) {
                updateProject(selectedId, p => ({
                  ...p,
                  sessionsConfig: {
                    ...(p.sessionsConfig ?? {}),
                    [docModal.docId]: (p.sessionsConfig?.[docModal.docId] ?? []).map((s: any) =>
                      s.id === docModal.session.id
                        ? { ...s, content, lastEditedAt: new Date().toISOString() }
                        : s
                    ),
                  },
                }));
              }
            }
          }}
          onMergeToMaster={
            docModal.session && user.role === 'pm' && docModal.session.owner !== 'pm'
              ? (sessionContent) => handleMergeToMaster(docModal.docId, docModal.session, sessionContent)
              : undefined
          }
        />
      )}

      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onProjectCreated={(result) => {
            const newProj = {
              id:              result.id,
              createdAt:       new Date().toISOString(),
              status:          'active',
              context:         result,
              docStatus:       {
                __project: { status: 'draft', publishedAt: null, publishedBy: null },
                ...Object.fromEntries((result.document_register ?? []).map((d: any) => [d.doc_id, { status: 'pending', comments: [], lastUpdated: new Date().toISOString(), updatedBy: null }])),
              },
              processOutput:   null,
              mechanicalOutput: null,
            };
            setProjects(prev => [newProj, ...prev]);
            setSelectedId(result.id);
            setShowDetail(true);
            setShowNewProject(false);
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {showDetail && selectedProject ? (
          <ProjectDetailView
            key="detail"
            project={projectContext}
            projectId={selectedId}
            status={status}
            userRole={viewAs}
            sessionsConfig={sessionsConfig}
            onBack={() => { setShowDetail(false); setAgentError(''); setStepError(''); setStepProgress({}); }}
            processOutput={processOutput}
            mechanicalOutput={mechanicalOutput}
            onRunAgent={runAgent}
            runningAgent={runningAgent}
            agentError={agentError}
            docStatusMap={docStatusMap}
            deliverables={deliverables}
            processSteps={processSteps}
            onDocStatusChange={handleDocStatusChange}
            onDocComment={handleDocComment}
            onViewDocument={handleViewDocument}
            onReleaseSession={handleReleaseSession}
            onSuggestSessions={handleSuggestSessions}
            suggestingSession={suggestingSession}
            onRunStep={runStep}
            stepRunning={stepRunning}
            stepError={stepError}
            stepProgress={stepProgress}
            onPublish={handlePublish}
            onMarkComplete={handleMarkComplete}
            onDelete={handleDelete}
            onBuildReference={handleBuildReference}
            onViewSummary={handleViewSummary}
            isCompleted={selectedProject.status === 'completed'}
            isInLibrary={selectedProject._inLibrary === true}
          />
        ) : (
          <ProjectListView
            key="list"
            user={user}
            projects={projects}
            onSelectProject={(id) => { setSelectedId(id); setShowDetail(true); }}
            onNewProject={() => setShowNewProject(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
