import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import Login from './pages/Login';
import AppShell from './pages/AppShell';

function Guard() {
  const { user, loading } = useCompany();
  if (loading) return <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Loading…</div>;
  return user ? <AppShell /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <CompanyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginGuard />} />
          <Route path="/*"    element={<Guard />} />
        </Routes>
      </BrowserRouter>
    </CompanyProvider>
  );
}

function LoginGuard() {
  const { user, loading } = useCompany();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <Login />;
}
