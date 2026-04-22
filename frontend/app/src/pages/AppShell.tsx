import { useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { Library, LayoutDashboard, Network, LogOut, ChevronDown } from 'lucide-react';

type View = 'library' | 'dashboard' | 'graph';

export default function AppShell() {
  const { user, company, logout } = useCompany();
  const [view, setView] = useState<View>('library');

  const nav = [
    { id: 'library' as View,   label: 'Library',   icon: Library },
    { id: 'dashboard' as View, label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'graph' as View,     label: 'Knowledge Graph', icon: Network },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex flex-col bg-white border-r border-slate-100 shrink-0">
        {/* Company header */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {company?.name?.[0] ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{company?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-300 ml-auto shrink-0" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition ${
                view === id
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <p className="text-xs text-slate-500 truncate flex-1">{user?.email}</p>
            <button onClick={logout} className="text-slate-300 hover:text-slate-500 transition">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {view === 'library'   && <PlaceholderView label="Library" />}
        {view === 'dashboard' && <PlaceholderView label="Dashboard" />}
        {view === 'graph'     && <PlaceholderView label="Knowledge Graph" />}
      </main>
    </div>
  );
}

function PlaceholderView({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center text-slate-300">
      <p className="text-sm">{label} — coming soon</p>
    </div>
  );
}
