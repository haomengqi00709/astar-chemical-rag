const getToken = () => localStorage.getItem('ak_app_token');

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const r = await fetch(`/api/app${path}`, { ...init, headers });
  if (!r.ok) {
    const e = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(e.error || r.statusText);
  }
  return r.json();
}
