import React from 'react';
import {
  LayoutDashboard,
  Terminal,
  Library as LibraryIcon,
  Settings,
  HelpCircle,
  FileText,
  Shield,
  Briefcase,
  FlaskConical,
  Wrench,
  Building2,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Page, User } from '../types';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  user: User;
  companyName?: string;
}

const ROLE_ICONS = {
  pm:         Briefcase,
  process:    FlaskConical,
  mechanical: Wrench,
  owner:      Building2,
  admin:      ShieldCheck,
  viewer:     Eye,
};

const ROLE_COLORS = {
  pm:         'bg-blue-600',
  process:    'bg-emerald-600',
  mechanical: 'bg-orange-500',
  owner:      'bg-emerald-600',
  admin:      'bg-slate-800',
  viewer:     'bg-slate-400',
};

const ROLE_LABELS = {
  pm:         'Project Manager',
  process:    'Process Engineer',
  mechanical: 'Mechanical Engineer',
  owner:      'Knowledge Base Owner',
  admin:      'Admin',
  viewer:     'Viewer',
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, user, companyName }) => {
  const RoleIcon = ROLE_ICONS[user.role];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'query',     label: 'Query',        icon: Terminal },
    { id: 'skills',    label: 'Skills',       icon: Terminal },
    { id: 'library',   label: 'Library',      icon: LibraryIcon },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col bg-slate-50 z-50">
      <div className="flex flex-col h-full py-6">
        {/* Logo */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-8 bg-primary-container rounded flex items-center justify-center">
              <Shield className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold uppercase tracking-widest text-slate-900 leading-none">{companyName || 'A Star Chemical'}</h2>
              <p className="text-[10px] text-slate-500 font-mono tracking-tighter">Engineering Platform</p>
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100">
            <div className={`h-8 w-8 ${ROLE_COLORS[user.role]} rounded-lg flex items-center justify-center shrink-0`}>
              <RoleIcon className="text-white w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id as Page)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                currentPage === item.id
                  ? 'text-slate-900 font-bold border-r-2 border-slate-900 bg-slate-200/50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/30'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-headline text-sm font-medium tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 mt-auto space-y-4">
          <div className="pt-4 border-t border-slate-200/20">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors">
              <HelpCircle className="w-4 h-4" /> Support
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors">
              <FileText className="w-4 h-4" /> Documentation
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
