import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
  company_id: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
}

interface CompanyContextValue {
  user: User | null;
  company: Company | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  setup: (companyName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken]     = useState<string | null>(() => localStorage.getItem('ak_app_token'));
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem('ak_app_token');
    if (!saved) { setLoading(false); return; }
    fetch('/api/app/auth/me', { headers: { Authorization: `Bearer ${saved}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ user: u, company: c }) => { setUser(u); setCompany(c); setToken(saved); })
      .catch(() => { localStorage.removeItem('ak_app_token'); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await fetch('/api/app/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Login failed'); }
    const { token: t, user: u, company: c } = await r.json();
    localStorage.setItem('ak_app_token', t);
    setToken(t); setUser(u); setCompany(c);
  };

  const setup = async (companyName: string, email: string, password: string) => {
    const r = await fetch('/api/app/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_name: companyName, admin_email: email, admin_password: password }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Setup failed'); }
    const { token: t, user: u, company: c } = await r.json();
    localStorage.setItem('ak_app_token', t);
    setToken(t); setUser(u); setCompany(c);
  };

  const logout = () => {
    localStorage.removeItem('ak_app_token');
    setToken(null); setUser(null); setCompany(null);
  };

  return (
    <CompanyContext.Provider value={{ user, company, token, login, setup, logout, loading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used inside CompanyProvider');
  return ctx;
}
