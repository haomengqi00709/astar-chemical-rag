import React from 'react';
import { Shield, Briefcase, FlaskConical, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';

const ROLES: User[] = [
  {
    id: 'daniel',
    name: 'Daniel',
    role: 'pm',
    title: 'Project Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    color: 'from-blue-600 to-blue-800',
  },
  {
    id: 'aria',
    name: 'Aria',
    role: 'process',
    title: 'Process Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    color: 'from-emerald-600 to-emerald-800',
  },
  {
    id: 'hunter',
    name: 'Hunter',
    role: 'mechanical',
    title: 'Mechanical Engineer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    color: 'from-orange-500 to-orange-700',
  },
];

const ROLE_ICONS = {
  pm: Briefcase,
  process: FlaskConical,
  mechanical: Wrench,
};

const ROLE_DESCRIPTIONS = {
  pm: 'Submit SOWs, manage the project pipeline, assign engineers, and track deliverables.',
  process: 'Run process calculations, identify fluid properties, and hand off hydraulic data.',
  mechanical: 'Execute pump calculations, select materials, and generate datasheets.',
};

interface SignInProps {
  onSignIn: (user: User) => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSignIn }) => {
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">A Star Chemical</h1>
        </div>
        <p className="text-slate-500 text-sm font-mono tracking-wide">Engineering Workflow Platform</p>
        <p className="text-slate-400 text-xs mt-1">Select your role to continue</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
        {ROLES.map((user, i) => {
          const Icon = ROLE_ICONS[user.role];
          return (
            <motion.button
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSignIn(user)}
              className="group bg-white rounded-2xl p-6 shadow-soft border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${user.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                <Icon className="text-white w-6 h-6" />
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-3 mb-1">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.title}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                {ROLE_DESCRIPTIONS[user.role]}
              </p>

              <div className={`w-full py-2 rounded-lg bg-gradient-to-r ${user.color} text-white text-xs font-bold text-center tracking-wide opacity-90 group-hover:opacity-100 transition-opacity`}>
                Sign in as {user.name}
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-10 text-xs text-slate-400">Mock authentication — no credentials required</p>
    </div>
  );
};
