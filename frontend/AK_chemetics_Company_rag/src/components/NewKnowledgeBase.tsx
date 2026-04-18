import React, { useState } from 'react';
import { ArrowLeft, Loader2, PlayCircle, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

interface NewKnowledgeBaseProps {
  onBack: () => void;
  onProjectCreated: (project: any, companyName: string) => void;
}

export const NewKnowledgeBase: React.FC<NewKnowledgeBaseProps> = ({ onBack, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter a company name.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', name.trim());
      const res = await fetch('/api/user-projects', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Failed to create project');
      const data = await res.json();
      onProjectCreated(data, name.trim());
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8">
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
      </motion.div>
    </div>
  );
};
