import { apiFetch } from '../lib/api';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Paperclip, Terminal, History, Bolt, Search, Loader2, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SourceEntry {
  doc_id: string;
  source_folder: string;
  discipline_name: string;
  revision: string;
  chunk_count: number;
  constraint_count: number;
  retrieved_for: string[];
  fetched_directly: boolean;
}

interface QueryComment {
  text: string;
  doc_id: string;
  page: string | number;
}

interface QueryResult {
  answer: string;
  sub_questions: string[];
  source_map: SourceEntry[];
  comments: QueryComment[];
  forced_skill: string | null;
}

interface Skill {
  name: string;
  slash: string;
  file: string;
  description: string;
}

const EXAMPLE_QUESTIONS = [
  'What are the stages of P&ID development and who approves each stage?',
  '/corrosion_allowance brine feed pipe, rate 0.125mm/yr, design life 20 years',
  '/pressure_test AVC vent pipe, design pressure 200 kPa, hydro test 280 kPa',
  'What fluid codes exist and what do they represent?',
];

export const Query: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Skills fetched from API
  const [skills, setSkills] = useState<Skill[]>([]);

  // Slash command autocomplete state
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');

  // Skill search bar state
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillSearchRef = useRef<HTMLInputElement>(null);
  const skillDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/skills')
      .then(r => r.json())
      .then(d => setSkills(d.skills || []))
      .catch(() => {});
  }, []);

  // Close skill dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        skillSearchRef.current && !skillSearchRef.current.contains(e.target as Node) &&
        skillDropdownRef.current && !skillDropdownRef.current.contains(e.target as Node)
      ) {
        setShowSkillDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Detect slash command while typing
  const handleQuestionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setQuestion(val);

    // Show slash menu when input is "/something" with no space yet
    const slashMatch = val.match(/^\/(\w*)$/);
    if (slashMatch) {
      setSlashQuery(slashMatch[1].toLowerCase());
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  }, []);

  const applySlashCommand = (skill: Skill) => {
    setQuestion(`${skill.slash} `);
    setShowSlashMenu(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const applySkillFromSearch = (skill: Skill) => {
    setQuestion(`${skill.slash} `);
    setSkillSearch('');
    setShowSkillDropdown(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') { setShowSlashMenu(false); return; }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { handleSubmit(); }
  };

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;
    setShowSlashMenu(false);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Query failed');
      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Filtered lists
  const slashMenuSkills = skills.filter(s =>
    slashQuery === '' || s.name.startsWith(slashQuery)
  );

  const searchedSkills = skillSearch.trim()
    ? skills.filter(s =>
        s.name.includes(skillSearch.toLowerCase()) ||
        s.description.toLowerCase().includes(skillSearch.toLowerCase())
      )
    : skills;

  const sortedSourceMap = result
    ? [...result.source_map].sort((a, b) => b.chunk_count - a.chunk_count)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-16 p-8 flex-1 flex flex-col items-center"
    >
      <div className="w-full max-w-4xl space-y-10">

        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="font-headline text-5xl font-extrabold tracking-tight text-primary-container leading-tight">
            Welcome to TechLedger.
          </h2>
          <p className="font-body text-xl text-slate-500 max-w-2xl mx-auto font-light">
            How can I assist with your engineering compliance query today?
          </p>
        </div>

        {/* Input card */}
        <div className="bg-white rounded-xl shadow-soft p-1 transition-all hover:shadow-lg">

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent border-none focus:ring-0 p-8 font-body text-lg text-slate-900 placeholder:text-slate-300 resize-none outline-none"
            placeholder="Ask a compliance question or type / to use a skill…"
            rows={3}
            value={question}
            onChange={handleQuestionChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />

          {/* ── Slash command autocomplete ─────────────────────────────────── */}
          <AnimatePresence>
            {showSlashMenu && slashMenuSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="mx-4 mb-2 border border-outline-variant/20 rounded-xl overflow-hidden shadow-sm"
              >
                <div className="px-4 py-2 bg-surface-container-low border-b border-outline-variant/10 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-secondary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Available Skills</span>
                </div>
                {slashMenuSkills.map(skill => (
                  <button
                    key={skill.name}
                    onMouseDown={e => { e.preventDefault(); applySlashCommand(skill); }}
                    className="w-full flex items-start gap-4 px-5 py-3.5 hover:bg-surface-container-low transition-colors text-left border-b border-outline-variant/5 last:border-0 bg-white group"
                  >
                    <code className="text-sm font-bold text-secondary shrink-0 mt-0.5 group-hover:text-primary-container transition-colors">
                      {skill.slash}
                    </code>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug truncate">{skill.description}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{skill.file}</p>
                    </div>
                    <span className="text-[10px] text-slate-300 shrink-0 mt-1">↵ select</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action bar */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/20">
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-secondary hover:bg-surface-container-low rounded-lg transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-secondary hover:bg-surface-container-low rounded-lg transition-colors">
                <Terminal className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-secondary hover:bg-surface-container-low rounded-lg transition-colors">
                <History className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              {loading && (
                <span className="text-sm text-slate-400 font-mono animate-pulse">Running agent…</span>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading || !question.trim()}
                className="technical-gradient text-white px-6 py-2.5 rounded-md font-bold tracking-tight flex items-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Execute Query</span>
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Bolt className="w-4 h-4 fill-current" />}
              </button>
            </div>
          </div>
        </div>

        {/* Example questions */}
        {!result && !loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
              <span className="font-headline text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Try an example</span>
              <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  className="text-left px-4 py-3 bg-white rounded-lg border border-outline-variant/20 text-sm text-slate-600 hover:border-secondary/40 hover:text-slate-900 hover:shadow-sm transition-all font-body"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Skill quick search ─────────────────────────────────────────── */}
        {!result && !loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
              <span className="font-headline text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Quick search skills</span>
              <div className="h-[1px] flex-1 bg-outline-variant/30"></div>
            </div>

            <div className="max-w-xl mx-auto w-full relative">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  ref={skillSearchRef}
                  type="text"
                  value={skillSearch}
                  onChange={e => setSkillSearch(e.target.value)}
                  onFocus={() => setShowSkillDropdown(true)}
                  placeholder="Search skills by name or description…"
                  className="w-full bg-white border border-outline-variant/30 rounded-full py-3 pl-12 pr-4 text-sm font-body focus:ring-2 focus:ring-secondary/20 focus:border-secondary/30 outline-none transition-all shadow-sm"
                />
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {showSkillDropdown && (
                  <motion.div
                    ref={skillDropdownRef}
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden z-20"
                  >
                    {searchedSkills.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-slate-400">
                        No skills match "{skillSearch}"
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/10 flex items-center gap-2">
                          <Zap className="w-3 h-3 text-secondary" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {searchedSkills.length} skill{searchedSkills.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {searchedSkills.map(skill => (
                          <button
                            key={skill.name}
                            onMouseDown={e => { e.preventDefault(); applySkillFromSearch(skill); }}
                            className="w-full flex items-start gap-4 px-5 py-4 hover:bg-surface-container-low transition-colors text-left border-b border-outline-variant/5 last:border-0 group"
                          >
                            <code className="text-sm font-bold text-secondary shrink-0 mt-0.5 group-hover:text-primary-container transition-colors">
                              {skill.slash}
                            </code>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800">{skill.name.replace(/_/g, ' ')}</p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{skill.description}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-300 shrink-0 mt-1 group-hover:text-secondary transition-colors">
                              {skill.file}
                            </span>
                          </button>
                        ))}
                        <div className="px-5 py-2.5 bg-surface-container-low border-t border-outline-variant/10 text-center">
                          <span className="text-[10px] text-slate-400">Click a skill to insert into the query box</span>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-800 text-sm">Query Failed</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl p-8 shadow-soft space-y-4 animate-pulse"
            >
              <div className="h-3 bg-slate-100 rounded w-1/4"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pb-16"
            >
              {/* Answer */}
              <div className="bg-white rounded-xl shadow-soft p-8">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Answer</span>
                  {result.forced_skill && (
                    <span className="text-[10px] font-mono bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-0.5 rounded-full">
                      /{result.forced_skill}
                    </span>
                  )}
                </div>
                <div className="font-body text-slate-800 leading-relaxed whitespace-pre-wrap text-sm">
                  {result.answer}
                </div>
              </div>

              {/* Sub-questions */}
              {result.sub_questions.length > 1 && (
                <div className="bg-surface-container-low rounded-xl p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                    Sub-questions investigated ({result.sub_questions.length})
                  </p>
                  <ol className="space-y-2">
                    {result.sub_questions.map((sq, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <span className="font-mono text-secondary font-bold shrink-0 mt-0.5">{i + 1}.</span>
                        <span>{sq}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Source map */}
              {sortedSourceMap.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                    Documents used ({sortedSourceMap.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sortedSourceMap.map(doc => (
                      <div key={doc.doc_id} className="bg-white rounded-xl p-4 shadow-soft border border-outline-variant/5">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <code className="text-sm font-bold text-primary-container">{doc.doc_id}</code>
                          <div className="flex flex-wrap gap-1 justify-end">
                            <span className="text-[10px] font-mono bg-surface-container-low text-slate-500 px-1.5 py-0.5 rounded">
                              {doc.chunk_count} chunks
                            </span>
                            {doc.constraint_count > 0 && (
                              <span className="text-[10px] font-mono bg-tertiary-fixed text-on-tertiary-container px-1.5 py-0.5 rounded">
                                {doc.constraint_count} constraints
                              </span>
                            )}
                            {doc.fetched_directly && (
                              <span className="text-[10px] font-mono bg-secondary-fixed text-on-secondary-fixed-variant px-1.5 py-0.5 rounded">
                                ref followed
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span className="uppercase">{doc.source_folder}</span>
                          {doc.revision && <><span>•</span><span>{doc.revision}</span></>}
                        </div>
                        {doc.discipline_name && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{doc.discipline_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviewer notes */}
              {result.comments.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-4">
                    Reviewer notes — informal context only
                  </p>
                  <div className="space-y-3">
                    {result.comments.map((c, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <code className="text-[10px] text-amber-600 shrink-0 mt-0.5 font-mono">
                          [{c.doc_id} p.{c.page}]
                        </code>
                        <p className="text-sm text-amber-900">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset */}
              <div className="text-center">
                <button
                  onClick={() => { setResult(null); setQuestion(''); }}
                  className="text-sm text-slate-400 hover:text-slate-700 transition-colors underline underline-offset-2"
                >
                  Ask another question
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
};
