import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, PlayCircle, Building2, ChevronRight, FolderOpen, Clock } from 'lucide-react';
import { motion } from 'motion/react';

function getSessionId(): string {
  const key = 'ak_session_id';
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}

function displayName(raw: string) {
  return raw.replace(/^__standard__/, '') || raw;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

interface NewKnowledgeBaseProps {
  onBack: () => void;
  onProjectCreated: (project: any, companyName: string) => void;
  onProjectSelected: (project: any) => void;
}

export const NewKnowledgeBase: React.FC<NewKnowledgeBaseProps> = ({ onBack, onProjectCreated, onProjectSelected }) => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const sid = getSessionId();
    fetch(`/api/user-projects?session_id=${sid}`)
      .then(r => r.json())
      .then((projects: any[]) => {
        // Sort newest first
        const sorted = [...projects].sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setHistory(sorted);
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter a company name.'); return; }
    setError('');
    setSubmitting(true);
    const sid = getSessionId();
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      const res = await fetch('/api/user-projects', {
        method: 'POST',
        body: fd,
        headers: { 'X-Session-ID': sid },
      });
      if (!res.ok) throw new Error('Failed to create project');
      const data = await res.json();
      onProjectCreated(data, name.trim());
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'ready')      return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">Ready</span>;
    if (status === 'processing') return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 animate-spin" />Building</span>;
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Failed</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex gap-6 items-start">
          {/* ── Left: Create card ── */}
          <div className="flex-1 bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-6">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Create Your Knowledge Base</h2>
            <p className="text-sm text-slate-500 mb-8">Enter your company name to get started. You can upload documents any time after.</p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-2">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="e.g. ACME Engineering"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-colors"
              />
            </div>

            {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting || !name.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              {submitting ? 'Creating…' : 'Get Started'}
            </button>
          </div>

          {/* ── Right: History panel ── */}
          <div className="w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-bold text-slate-700">Previous Knowledge Bases</p>
              </div>

              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <FolderOpen className="w-8 h-8 text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400">No previous knowledge bases found.</p>
                  <p className="text-[11px] text-slate-300 mt-1">Create one on the left to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto">
                  {history.map(proj => (
                    <button
                      key={proj.id}
                      onClick={() => onProjectSelected(proj)}
                      className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                            {displayName(proj.name)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {statusBadge(proj.status)}
                            <span className="text-[10px] text-slate-400 font-mono">
                              {(proj.files?.length ?? 0)} file{(proj.files?.length ?? 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {proj.created_at && (
                            <p className="text-[10px] text-slate-400 mt-1">{formatDate(proj.created_at)}</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 shrink-0 mt-0.5 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
