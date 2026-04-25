import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/app/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  };

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Check your email</h1>
        <p className="text-sm text-slate-400 mb-6">
          If an account exists for <span className="text-slate-600 font-medium">{email}</span>, we've sent a reset link. Check your spam folder if you don't see it.
        </p>
        <Link to="/login" className="text-sm text-slate-700 font-medium hover:underline">Back to sign in</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Forgot password</h1>
        <p className="text-sm text-slate-400 mb-6">Enter your email and we'll send a reset link</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@company.com" required
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-slate-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-4">
          <Link to="/login" className="text-slate-700 font-medium hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
