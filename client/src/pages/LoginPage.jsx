import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Recycle, Lock, Mail, ArrowRight, ShieldCheck, HardHat, Home } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = (user) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (user.role === 'admin') navigate('/admin');
    else if (user.role === 'worker') navigate('/worker');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        redirectAfterLogin(user);
      }
    } catch (err) {
      // Handled by axios interceptor toast
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper
  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo@1234');
    setLoading(true);
    try {
      const user = await login(demoEmail, 'Demo@1234');
      if (user) {
        redirectAfterLogin(user);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-6 sm:py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-600/30">
              <Recycle className="w-7 h-7 text-emerald-300" />
            </div>
          </Link>
          <h1 className="text-2xl font-heading font-black text-ink dark:text-white">
            Sign In to Kachra Bazar
          </h1>
          <p className="text-xs text-muted">
            Smart Municipal Solid Waste Platform • Bhopal Pilot
          </p>
        </div>

        {/* Quick One-Click Demo Accounts Strip */}
        <div className="p-4 rounded-3xl bg-primary-50/80 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary-800 dark:text-primary-300">
              Instant Demo Access (Evaluation)
            </span>
            <span className="text-[10px] text-muted font-mono">Password: Demo@1234</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@kachrabazar.in')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-primary-200 dark:border-gray-800 hover:border-primary-500 shadow-sm transition-all hover:scale-[1.02] text-center"
            >
              <ShieldCheck className="w-5 h-5 text-purple-600 mb-1" />
              <span className="text-xs font-bold text-ink dark:text-white leading-tight">Admin</span>
              <span className="text-[10px] text-muted">Full Control</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('worker1@kachrabazar.in')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-primary-200 dark:border-gray-800 hover:border-primary-500 shadow-sm transition-all hover:scale-[1.02] text-center"
            >
              <HardHat className="w-5 h-5 text-amber-600 mb-1" />
              <span className="text-xs font-bold text-ink dark:text-white leading-tight">Worker</span>
              <span className="text-[10px] text-muted">Route & Verify</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('citizen@kachrabazar.in')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-primary-200 dark:border-gray-800 hover:border-primary-500 shadow-sm transition-all hover:scale-[1.02] text-center"
            >
              <Home className="w-5 h-5 text-emerald-600 mb-1" />
              <span className="text-xs font-bold text-ink dark:text-white leading-tight">Citizen</span>
              <span className="text-[10px] text-muted">Pickups & Points</span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft-lg space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink dark:text-gray-200 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@kachrabazar.in or gmail.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-ink dark:text-gray-200">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-muted border-t border-gray-100 dark:border-gray-800">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Register as Citizen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
