import React from 'react';
import { Shield, Briefcase, FlaskConical, Wrench, ShieldCheck, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

interface AdminSignInProps {
  companyName: string;
  onSignIn: (user: User) => void;
}

const INACTIVE_ROLES = [
  { icon: Briefcase,   label: 'Project Manager',    color: 'bg-blue-200',    text: 'text-blue-300' },
  { icon: FlaskConical, label: 'Process Engineer',   color: 'bg-emerald-200', text: 'text-emerald-300' },
  { icon: Wrench,      label: 'Mechanical Engineer', color: 'bg-orange-200',  text: 'text-orange-300' },
];

export const AdminSignIn: React.FC<AdminSignInProps> = ({ companyName, onSignIn }) => {
  const handleAdmin = () => {
    onSignIn({
      id: 'admin',
      name: 'Admin',
      role: 'owner',
      title: 'IT Administrator',
      avatar: '',
      color: 'from-violet-600 to-violet-800',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-10 w-10 bg-primary-container rounded-lg flex items-center justify-center">
            <Shield className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">{companyName}</h1>
        </div>
        <p className="text-slate-500 text-sm font-mono tracking-wide">Knowledge Base Platform</p>
        <p className="text-slate-400 text-xs mt-1">Select your role to continue</p>
      </motion.div>

      <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
        {/* Admin card — active */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleAdmin}
          className="group bg-white rounded-2xl p-6 shadow-soft border border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all duration-200 text-left w-72"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div className="mb-4">
            <p className="font-bold text-slate-900">Admin</p>
            <p className="text-xs text-slate-500">IT Administrator</p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-5">
            Manage company standards, upload reference projects, and configure the knowledge base.
          </p>
          <div className="w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-800 text-white text-xs font-bold text-center tracking-wide opacity-90 group-hover:opacity-100 transition-opacity">
            Sign in as Admin
          </div>
        </motion.button>

        {/* Inactive roles row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full"
        >
          <div className="flex items-center gap-3 mb-4 justify-center">
            <div className="h-px flex-1 bg-slate-200 max-w-xs" />
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">More roles available</span>
            <div className="h-px flex-1 bg-slate-200 max-w-xs" />
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {INACTIVE_ROLES.map((r, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 border border-slate-100 opacity-50 cursor-not-allowed select-none"
              >
                <div className={`h-9 w-9 rounded-lg ${r.color} flex items-center justify-center mb-3`}>
                  <r.icon className={`w-4 h-4 ${r.text}`} />
                </div>
                <p className="text-xs font-semibold text-slate-400">{r.label}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <button
              disabled
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-slate-300 text-slate-400 text-xs font-medium cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Roles
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
