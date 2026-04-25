import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [params]              = useSearchParams();
  const token                 = params.get('token') || '';
  const navigate              = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return; }
    setError(''); setLoading(true);
    try {
      const r = await fetch('/api/app/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-slate-500 text-sm mb-2">Invalid reset link.</p>
        <Link to="/login" className="text-sm text-slate-700 font-medium hover:underline">Back to sign in</Link>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Password updated</h1>
        <p className="text-sm text-slate-400 mb-6">You can now sign in with your new password.</p>
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-slate-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-700 transition"
        >
          Sign in
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Set new password</h1>
        <p className="text-sm text-slate-400 mb-6">Choose a strong password for your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">New password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min. 8 characters" required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Confirm password</label>
            <input
              type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full bg-slate-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
