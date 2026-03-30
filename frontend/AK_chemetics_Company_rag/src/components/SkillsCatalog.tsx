import React, { useState, useEffect, useRef } from 'react';
import { Waves, Droplet, Gauge, Wrench, Filter, CloudUpload, FileText, Code, Copy, Search, Sparkles, X, Wand2, Terminal, CheckCircle, AlertCircle, Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface Skill {
  name: string;
  slash: string;
  file: string;
  description: string;
}

interface DeployStatus {
  success: boolean;
  message: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  corrosion_allowance: Waves,
  fluid_scope: Droplet,
  pressure_test: Gauge,
};

function toDisplayName(name: string) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getIcon(name: string) {
  return ICON_MAP[name] || Wrench;
}

const SKILL_TEMPLATE = `import json


def check_skill_name(
    param1: float,
    param2: float,
) -> str:
    """
    One-line description of what this skill checks.

    Args:
        param1: Description of param1 (units).
        param2: Required threshold or reference value (units).

    Returns:
        JSON string with result, required value, compliant flag, and verdict.
    """
    compliant = param1 >= param2
    result = {
        'param1': param1,
        'required': param2,
        'compliant': compliant,
        'verdict': 'COMPLIANT' if compliant else 'NON-COMPLIANT',
    }
    return json.dumps(result)
`;

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const SkillsCatalog: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  // Spotlight search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Skills Lab modal
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [requirements, setRequirements] = useState('');
  const [pythonCode, setPythonCode] = useState(SKILL_TEMPLATE);
  const [isRefining, setIsRefining] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<DeployStatus | null>(null);

  const fetchSkills = () => {
    setSkillsLoading(true);
    fetch('/api/skills')
      .then(r => r.json())
      .then(d => setSkills(d.skills || []))
      .catch(() => setSkills([]))
      .finally(() => setSkillsLoading(false));
  };

  useEffect(() => { fetchSkills(); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsSearchOpen(true); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') { e.preventDefault(); openLab(); }
      if (e.key === 'Escape') { setIsSearchOpen(false); setIsLabOpen(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [isSearchOpen]);

  const openLab = () => {
    setDeployStatus(null);
    setIsLabOpen(true);
  };

  const closeLab = () => {
    setIsLabOpen(false);
    setDeployStatus(null);
  };

  const filteredSkills = skills.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefineRequirements = async () => {
    if (!requirements.trim()) return;
    setIsRefining(true);
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Format the following engineering requirements into a structured skill specification.
Use plain text (no markdown). Include: Objective, Inputs (with units), Standards referenced, Constraints, and Expected output format.

Requirements:
${requirements}`,
      });
      setRequirements(response.text || requirements);
    } catch (error) {
      console.error('Error refining requirements:', error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!skillName.trim() || !requirements.trim()) return;
    setIsGenerating(true);
    try {
      const fnName = `check_${skillName.trim()}`;
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a Python compliance skill function for these engineering requirements.

Skill name: ${skillName.trim()}
Function name MUST be: ${fnName}

Requirements:
${requirements}

Rules:
- Function name must be exactly: ${fnName}
- Type-annotate every parameter (float, str, int)
- Docstring must describe each parameter: name, what it represents, and units
- Return json.dumps() of a dict that always includes: 'compliant' (bool), 'verdict' ('COMPLIANT' or 'NON-COMPLIANT')
- Include the actual numbers and thresholds in the result dict so the LLM can cite them
- Start with: import json
- Return ONLY valid Python code — no markdown fences, no explanation

Example structure:
import json

def ${fnName}(value: float, required: float) -> str:
    """
    One-line description.

    Args:
        value: The engineer-provided value (units).
        required: The minimum required value from project standards (units).

    Returns:
        JSON string with value, required, margin, compliant flag, and verdict.
    """
    margin = round(value - required, 3)
    compliant = value >= required
    result = {
        'value': value,
        'required': required,
        'margin': margin,
        'compliant': compliant,
        'verdict': 'COMPLIANT' if compliant else 'NON-COMPLIANT',
    }
    return json.dumps(result)`,
      });
      let text = response.text || '';
      text = text.replace(/```python\n?|```/g, '').trim();
      setPythonCode(text);
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCorrectCode = async () => {
    if (!pythonCode.trim()) return;
    setIsCorrecting(true);
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Review and fix the following Python engineering skill function.
Ensure: correct type hints, proper docstring, json.dumps() return, includes 'verdict' key.
Return ONLY the corrected Python code, no explanation.

Code:
${pythonCode}`,
      });
      let text = response.text || '';
      text = text.replace(/```python\n?|```/g, '').trim();
      setPythonCode(text);
    } catch (error) {
      console.error('Error correcting code:', error);
    } finally {
      setIsCorrecting(false);
    }
  };

  const handleDeploy = async () => {
    const name = skillName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!name || !pythonCode.trim()) return;
    setIsDeploying(true);
    setDeployStatus(null);
    try {
      const res = await fetch('/api/skills/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code: pythonCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deploy failed');
      setDeployStatus({ success: true, message: `Deployed → skills/${name}.py — available in agent on next query.` });
      fetchSkills();
    } catch (e) {
      setDeployStatus({ success: false, message: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto space-y-12"
    >

      {/* ── Spotlight search modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20"
            >
              <div className="flex items-center px-6 py-4 border-b border-outline-variant/10">
                <Search className="w-5 h-5 text-slate-400 mr-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search skills..."
                  className="flex-1 bg-transparent border-none outline-none text-lg text-slate-800 placeholder:text-slate-400"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">ESC</span>
                  <button onClick={() => setIsSearchOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                </div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                {filteredSkills.length > 0 ? filteredSkills.map(skill => {
                  const Icon = getIcon(skill.name);
                  return (
                    <button key={skill.name} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-left group">
                      <div className="p-2 bg-surface-container-low rounded-lg text-secondary group-hover:bg-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-slate-800">{toDisplayName(skill.name)}</h4>
                          <span className="text-[10px] font-mono text-slate-400">{skill.file}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{skill.description}</p>
                      </div>
                    </button>
                  );
                }) : (
                  <div className="py-12 text-center">
                    <p className="text-slate-400 text-sm">No skills match "{searchQuery}"</p>
                  </div>
                )}
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-outline-variant/10 flex justify-between items-center">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <span className="px-1 py-0.5 bg-white border border-slate-200 rounded shadow-sm text-slate-600 font-bold">↑↓</span> Navigate
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                    <span className="px-1 py-0.5 bg-white border border-slate-200 rounded shadow-sm text-slate-600 font-bold">↵</span> Select
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skills Catalog</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Skills Lab modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isLabOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeLab}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/10 flex flex-col"
              style={{ height: 'min(85vh, 780px)' }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/10 shrink-0">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Skills Lab</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Define requirements → generate Python → deploy to the RAG pipeline</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Deploy status inline */}
                  <AnimatePresence>
                    {deployStatus && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                          deployStatus.success
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {deployStatus.success
                          ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                          : <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        }
                        {deployStatus.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying || !skillName.trim() || !pythonCode.trim()}
                    className="px-5 py-2 rounded-lg bg-primary-container text-white text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isDeploying
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Deploying…</>
                      : <><CloudUpload className="w-4 h-4" /> Deploy Skill</>
                    }
                  </button>
                  <button onClick={closeLab} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Skill name bar */}
              <div className="flex items-center gap-4 px-8 py-3 bg-surface-container-low border-b border-outline-variant/10 shrink-0">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">Skill Name</label>
                <input
                  type="text"
                  value={skillName}
                  onChange={e => setSkillName(e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. insulation_thickness"
                  className="flex-1 bg-white border border-outline-variant/20 rounded-lg px-4 py-2 text-sm font-mono focus:ring-2 focus:ring-secondary/20 focus:border-secondary/30 outline-none"
                />
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {skillName ? `→ check_${skillName}` : '→ check_skill_name'}
                </span>
              </div>

              {/* Two-panel editor */}
              <div className="flex flex-1 overflow-hidden">

                {/* Left: Requirements */}
                <div className="flex flex-col w-1/2 border-r border-outline-variant/10">
                  <div className="h-11 flex items-center justify-between px-6 bg-white border-b border-outline-variant/5 shrink-0">
                    <span className="text-[10px] font-bold tracking-widest text-secondary flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      REQUIREMENTS
                    </span>
                    <button
                      onClick={handleRefineRequirements}
                      disabled={isRefining || !requirements.trim()}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-secondary hover:text-primary transition-colors disabled:opacity-40"
                    >
                      <Sparkles className={`w-3 h-3 ${isRefining ? 'animate-pulse' : ''}`} />
                      {isRefining ? 'REFINING…' : 'AI REFINE'}
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      value={requirements}
                      onChange={e => setRequirements(e.target.value)}
                      className="absolute inset-0 w-full h-full p-6 font-body text-sm leading-relaxed text-slate-800 resize-none border-none outline-none focus:ring-0 bg-white"
                      placeholder={`Describe what this skill should calculate and check.\n\nFor example:\n- What inputs does the engineer provide?\n- What standard or list does the threshold come from?\n- What is the pass/fail condition?`}
                    />
                  </div>
                  <div className="px-4 py-3 bg-white border-t border-outline-variant/10 shrink-0">
                    <button
                      onClick={handleGenerateCode}
                      disabled={isGenerating || !skillName.trim() || !requirements.trim()}
                      className="w-full py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-sm font-bold text-secondary hover:bg-secondary/5 hover:border-secondary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isGenerating
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating code…</>
                        : <><Code className="w-4 h-4" /> Generate Python from Requirements</>
                      }
                    </button>
                  </div>
                </div>

                {/* Right: Python code */}
                <div className="flex flex-col w-1/2 bg-[#0F172A]">
                  <div className="h-11 flex items-center justify-between px-6 bg-[#1e293b] border-b border-white/5 shrink-0">
                    <span className="text-[10px] font-bold tracking-widest text-emerald-400 flex items-center gap-2">
                      <Terminal className="w-3 h-3" />
                      PYTHON SKILL
                    </span>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleCorrectCode}
                        disabled={isCorrecting || !pythonCode.trim()}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-40"
                      >
                        <Wand2 className={`w-3 h-3 ${isCorrecting ? 'animate-pulse' : ''}`} />
                        {isCorrecting ? 'FIXING…' : 'AI FIX'}
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(pythonCode).catch(() => {})}
                        className="text-white/40 hover:text-white transition-colors"
                        title="Copy code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      value={pythonCode}
                      onChange={e => setPythonCode(e.target.value)}
                      className="absolute inset-0 w-full h-full p-6 font-mono text-[13px] leading-relaxed text-slate-300 bg-transparent resize-none border-none outline-none focus:ring-0"
                      spellCheck={false}
                    />
                  </div>
                  <div className="h-11 flex items-center justify-between px-6 bg-[#1e293b]/60 border-t border-white/5 shrink-0">
                    <span className="text-[10px] text-white/40 font-mono italic">
                      {isGenerating ? 'Generating from requirements…'
                        : isCorrecting ? 'AI is reviewing code…'
                        : skillName ? `check_${skillName}() · ready to deploy`
                        : 'enter a skill name to begin'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Skills catalog ────────────────────────────────────────────────── */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tighter mb-1">Skills Catalog</h2>
            <p className="text-sm text-slate-500 max-w-md">Live engineering logic modules registered in the RAG pipeline.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-md text-xs font-bold hover:bg-surface-container-low transition-colors"
            >
              <Search className="w-3 h-3" />
              Search Skills <span className="ml-2 text-slate-400 font-normal">⌘K</span>
            </button>
            <button
              onClick={openLab}
              className="flex items-center gap-2 px-4 py-2 bg-primary-container text-white rounded-md text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3 h-3" />
              New Skill <span className="ml-1 text-white/50 font-normal">⌘N</span>
            </button>
          </div>
        </div>

        {skillsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl animate-pulse min-h-[220px] border border-outline-variant/5">
                <div className="h-8 w-8 bg-slate-100 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-100 rounded w-full mb-1"></div>
                <div className="h-3 bg-slate-100 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skills.map(skill => {
              const Icon = getIcon(skill.name);
              return (
                <div
                  key={skill.name}
                  className="bg-white p-6 rounded-xl group hover:shadow-2xl hover:shadow-primary-container/5 transition-all duration-300 flex flex-col justify-between min-h-[220px] border border-outline-variant/5"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="p-2 bg-surface-container-low rounded-lg text-secondary">
                        <Icon className="w-5 h-5" />
                      </span>
                      <span className="px-2 py-1 rounded-full text-[9px] font-bold tracking-widest bg-tertiary-fixed text-on-tertiary-container">
                        LIVE
                      </span>
                    </div>
                    <h3 className="font-bold text-lg tracking-tight mb-2">{toDisplayName(skill.name)}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{skill.description}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                    <code className="text-[10px] font-mono text-secondary">{skill.file}</code>
                    <code className="text-[10px] font-mono text-slate-400">{skill.slash}</code>
                  </div>
                </div>
              );
            })}

            {/* Create new skill card */}
            <button
              onClick={openLab}
              className="border-2 border-dashed border-outline-variant/20 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-secondary/40 hover:text-secondary transition-all cursor-pointer group min-h-[220px]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-secondary/10 transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">Create New Skill</span>
              <span className="text-[10px] text-slate-300 mt-1 group-hover:text-secondary/50">⌘N</span>
            </button>
          </div>
        )}
      </section>
    </motion.div>
  );
};
