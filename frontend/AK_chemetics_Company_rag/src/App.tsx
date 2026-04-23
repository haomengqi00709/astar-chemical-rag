import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { Query } from './components/Query';
import { SkillsCatalog } from './components/SkillsCatalog';
import { Library } from './components/Library';
import { SignIn } from './components/SignIn';
import { AdminSignIn } from './components/AdminSignIn';
import { Landing } from './components/Landing';
import { NewKnowledgeBase } from './components/NewKnowledgeBase';
import { Page, User } from './types';

type AppMode = 'landing' | 'demo' | 'new-kb-name' | 'new-kb-role' | 'new-kb-app';

export default function App() {
  const [mode, setMode] = useState<AppMode>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [companyName, setCompanyName] = useState('');
  const [defaultProjectId, setDefaultProjectId] = useState<string | undefined>();
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);

  // ── Landing ──────────────────────────────────────────────────────────────
  if (mode === 'landing') {
    return (
      <Landing
        onDemo={() => { setMode('demo'); setCurrentPage('dashboard'); }}
        onNew={() => setMode('new-kb-name')}
      />
    );
  }

  // ── Start New: enter company name ────────────────────────────────────────
  if (mode === 'new-kb-name') {
    return (
      <NewKnowledgeBase
        onBack={() => setMode('landing')}
        onProjectCreated={(_project, name) => {
          setCompanyName(name);
          setMode('new-kb-role');
        }}
        onProjectSelected={(proj) => {
          const name = proj.name.replace(/^__standard__/, '') || proj.name;
          setCompanyName(name);
          setDefaultProjectId(proj.id);
          setUser({ id: 'admin', name: 'Admin', role: 'owner', title: 'IT Administrator', avatar: '', color: '' });
          setCurrentPage('library');
          setMode('new-kb-app');
        }}
      />
    );
  }

  // ── Start New: choose role (Admin or greyed-out others) ──────────────────
  if (mode === 'new-kb-role') {
    return (
      <AdminSignIn
        companyName={companyName}
        onSignIn={(u) => { setUser(u); setCurrentPage('dashboard'); setMode('new-kb-app'); }}
      />
    );
  }

  // ── Demo: standard role selection ────────────────────────────────────────
  if (mode === 'demo' && !user) {
    return <SignIn onSignIn={(u) => { setUser(u); setCurrentPage('dashboard'); }} />;
  }

  if (!user) return null;

  // ── App shell (demo or new-kb-app) ───────────────────────────────────────
  const isAdmin = mode === 'new-kb-app';

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard user={user} isAdmin={isAdmin} onGoToLibrary={() => { setCurrentPage('library'); setLibraryRefreshKey(k => k + 1); }} />;
      case 'query':     return <Query />;
      case 'skills':    return <SkillsCatalog />;
      default:          return <Dashboard user={user} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'query':     return 'Compliance Query Agent';
      case 'skills':    return 'Skills & Calculations';
      case 'library':   return 'Knowledge Base';
      default:          return 'Dashboard';
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setCompanyName('');
    setMode('landing');
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        user={user}
        companyName={companyName || undefined}
      />
      <main className="flex-1 ml-64 flex flex-col min-h-0">
        <TopBar title={getPageTitle()} user={user} onSignOut={handleSignOut} />
        <div className="flex-1 min-h-0 overflow-auto" style={{ display: currentPage === 'library' ? 'none' : 'flex', flexDirection: 'column' }}>
          {renderPage()}
        </div>
        {/* Library is always mounted to preserve state across tab switches */}
        <div className="flex-1 min-h-0 overflow-hidden" style={{ display: currentPage === 'library' ? 'flex' : 'none', flexDirection: 'column' }}>
          <Library isAdmin={isAdmin} companyName={companyName || undefined} defaultUserProjectId={defaultProjectId} refreshSignal={libraryRefreshKey} />
        </div>
      </main>
    </div>
  );
}
