import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const ROLE_HOME = {
  STUDENT: '/student/events',
  ORGANIZER: '/organizer/events',
  ADMIN: '/admin/dashboard',
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email, password) => {
    setError('');
    setLoading(true);
    setForm({ email, password });
    try {
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mx-auto flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg shadow-indigo-500/30 mb-3">
              ⚡
            </div>
            <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">Welcome to CEMS</h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">College Event Management & Reservation Portal</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl p-4 mb-6 text-center">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="name@college.edu"
                className="w-full rounded-xl border border-slate-200/90 bg-white/90 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200/90 bg-white/90 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            <Button type="submit" loading={loading} className="w-full py-3.5 text-base mt-2 shadow-lg shadow-indigo-500/25">
              Sign In to Account &rarr;
            </Button>
          </form>

          {/* Quick Demo Login Tabs */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Instant Demo Sign-In:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@cems.edu', 'Admin@123')}
                className="py-2.5 px-2 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('organizer@cems.edu', 'Organizer@123')}
                className="py-2.5 px-2 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                🎯 Organizer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('student@cems.edu', 'Student@123')}
                className="py-2.5 px-2 bg-sky-50/80 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl border border-sky-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                🎓 Student
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-6 text-center">
            Need a new student or organizer account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


