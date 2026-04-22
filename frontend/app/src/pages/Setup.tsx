import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';

export default function Setup() {
  const { setup } = useCompany();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return; }
    setError(''); setLoading(true);
    try {
      await setup(companyName, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Set up your company</h1>
        <p className="text-sm text-slate-400 mb-6">Create your knowledge base workspace</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Company name</label>
            <input
              type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Acme Corp" required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Admin email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@company.com" required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
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
            {loading ? 'Creating…' : 'Create workspace'}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-700 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
