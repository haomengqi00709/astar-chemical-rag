const getToken = () => localStorage.getItem('ak_app_token');

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  // Auth routes go to /api/app/*, all others reuse existing /api/* routes
  const base = path.startsWith('/auth') || path.startsWith('/admin') ? '/api/app' : '/api';
  const r = await fetch(`${base}${path}`, { ...init, headers });
  if (!r.ok) {
    const e = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(e.error || r.statusText);
  }
  return r.json();
}
