import { useState } from 'react';
import { useCompany } from '../context/CompanyContext';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { Dashboard } from '../components/Dashboard';
import { Library } from '../components/Library';
import { Query } from '../components/Query';
import { SkillsCatalog } from '../components/SkillsCatalog';
import type { Page } from '../types';

export default function AppShell() {
  const { user, company, logout } = useCompany();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);

  if (!user || !company) return null;

  const appUser = { id: user.id, name: user.email.split('@')[0], role: user.role as any, title: '', avatar: '', color: '' };
  const isAdmin = user.role === 'admin';

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'query':     return 'Compliance Query Agent';
      case 'skills':    return 'Skills & Calculations';
      case 'library':   return 'Knowledge Base';
      default:          return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} user={appUser} companyName={company.name} />
      <main className="flex-1 ml-64 flex flex-col min-h-0">
        <TopBar title={getPageTitle()} user={appUser} onSignOut={logout} />
        <div className="flex-1 min-h-0 overflow-auto" style={{ display: currentPage === 'library' ? 'none' : 'flex', flexDirection: 'column' }}>
          {currentPage === 'dashboard' && <Dashboard user={appUser} isAdmin={isAdmin} onGoToLibrary={() => { setCurrentPage('library'); setLibraryRefreshKey(k => k + 1); }} />}
          {currentPage === 'query'     && <Query />}
          {currentPage === 'skills'    && <SkillsCatalog />}
        </div>
        <div className="flex-1 min-h-0 overflow-hidden" style={{ display: currentPage === 'library' ? 'flex' : 'none', flexDirection: 'column' }}>
          <Library isAdmin={isAdmin} companyName={company.name} refreshSignal={libraryRefreshKey} />
        </div>
      </main>
    </div>
  );
}
