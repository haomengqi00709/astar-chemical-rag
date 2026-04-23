import React from 'react';
import { Shield, BookOpen, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingProps {
  onDemo: () => void;
  onNew: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onDemo, onNew }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-10 w-10 bg-primary-container rounded-lg flex items-center justify-center">
            <Shield className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Hunters.ai</h1>
        </div>
        <p className="text-slate-500 text-sm font-mono tracking-wide">Engineering Knowledge Platform</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* View Demo */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={onDemo}
          className="group bg-white rounded-2xl p-8 shadow-soft border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-200 text-left"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <p className="font-bold text-slate-900 text-lg mb-2">View Demo</p>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Explore a fully built engineering knowledge base with real project data, wiki pages, and AI-powered search.
          </p>
          <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm font-bold text-center tracking-wide opacity-90 group-hover:opacity-100 transition-opacity">
            Open Demo
          </div>
        </motion.button>

        {/* Start New */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onNew}
          className="group bg-white rounded-2xl p-8 shadow-soft border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-200 text-left"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
            <Plus className="text-white w-6 h-6" />
          </div>
          <p className="font-bold text-slate-900 text-lg mb-2">Start New</p>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Upload your own engineering documents and build a custom knowledge base with wiki pages and a knowledge graph.
          </p>
          <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-sm font-bold text-center tracking-wide opacity-90 group-hover:opacity-100 transition-opacity">
            Build My Knowledge Base
          </div>
        </motion.button>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-xs text-slate-400"
      >
        Upload PDFs, Word documents, or Excel files to get started
      </motion.p>
    </div>
  );
};
