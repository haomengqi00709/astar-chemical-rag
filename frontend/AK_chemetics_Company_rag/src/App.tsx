import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { Query } from './components/Query';
import { SkillsCatalog } from './components/SkillsCatalog';
import { Library } from './components/Library';
import { SignIn } from './components/SignIn';
import { Page, User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (!user) {
    return <SignIn onSignIn={setUser} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'query':
        return <Query />;
      case 'skills':
        return <SkillsCatalog />;
      case 'library':
        return <Library />;
      default:
        return <Dashboard user={user} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'query':     return 'Compliance Query Agent';
      case 'skills':    return 'Skills & Calculations';
      case 'library':   return 'Technical Ledger';
      default:          return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    if (currentPage === 'skills') return '7,843 CHUNKS INDEXED';
    return undefined;
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} user={user} />
      <main className="flex-1 ml-64 flex flex-col min-h-0">
        <TopBar title={getPageTitle()} subtitle={getPageSubtitle()} user={user} onSignOut={() => setUser(null)} />
        <div className="flex-1 min-h-0 overflow-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
