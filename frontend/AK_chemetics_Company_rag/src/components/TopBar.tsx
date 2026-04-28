import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Search } from 'lucide-react';
import { User, PendingTask } from '../types';

interface TopBarProps {
  title: string;
  subtitle?: string;
  user: User;
  onSignOut: () => void;
  tasks?: PendingTask[];
  onTaskClick?: (projectId: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  pm:         'Project Manager',
  process:    'Process Engineer',
  mechanical: 'Mechanical Engineer',
  owner:      'Knowledge Base Owner',
};

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, user, onSignOut, tasks = [], onTaskClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/20 shadow-sm">
      <div className="flex justify-between items-center h-16 px-8">
        <div className="flex items-center gap-6">
          <h1 className="font-headline text-xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          {subtitle && (
            <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-mono font-bold tracking-wider text-on-surface-variant">
              {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search technical chunks..."
              className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-xs w-64 focus:ring-1 focus:ring-secondary focus:bg-white transition-all outline-none"
            />
          </div>

          {/* Bell with task badge */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(v => !v)}
              className="relative p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-400 hover:text-slate-900 transition-colors" />
              {tasks.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center leading-none">
                  {tasks.length > 9 ? '9+' : tasks.length}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700">My Tasks</p>
                  <span className="text-[10px] font-mono text-slate-400">{tasks.length} pending</span>
                </div>
                {tasks.length === 0 ? (
                  <p className="px-4 py-4 text-xs text-slate-400 text-center">No pending tasks</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                    {tasks.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { onTaskClick?.(t.projectId); setShowDropdown(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                      >
                        <p className="text-xs font-semibold text-slate-900 truncate">{t.docTitle}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{t.projectName}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold border border-slate-200">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-900 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              onClick={onSignOut}
              title="Sign out"
              className="ml-1 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
