import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Recycle, Lock, Mail, ArrowRight, ShieldCheck, HardHat, Home, Sparkles } from 'lucide-react';
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
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-6 sm:py-12 relative">
      {/* Background soft ambient glows */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/25 group-hover:scale-105 transition-all">
              <Recycle className="w-6 h-6 text-emerald-200 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </Link>
          <h1 className="text-2xl font-heading font-black text-stone-900 dark:text-white">
            Sign In to Kachra Bazar
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Smart Municipal Solid Waste Platform • Bhopal Pilot
          </p>
        </div>

        {/* Quick One-Click Demo Accounts Strip */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/80 dark:border-emerald-900/60 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Instant Demo Access (Viva & Demo)
            </span>
            <span className="text-[10px] text-stone-500 dark:text-gray-400 font-mono">Demo@1234</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@kachrabazar.in')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-200/60 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-500 shadow-sm hover:shadow transition-all active:scale-95 text-center group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-bold text-stone-900 dark:text-white leading-tight">Admin</span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">Full Control</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('worker1@kachrabazar.in')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-200/60 dark:border-gray-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-sm hover:shadow transition-all active:scale-95 text-center group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <HardHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-bold text-stone-900 dark:text-white leading-tight">Worker</span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">Route & Verify</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('citizen@kachrabazar.in')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-gray-900 border border-emerald-200/60 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-sm hover:shadow transition-all active:scale-95 text-center group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-stone-900 dark:text-white leading-tight">Citizen</span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">Pickups & Points</span>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-gray-900 border border-stone-200/80 dark:border-gray-800 shadow-soft-lg space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-gray-200 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@kachrabazar.in or gmail.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-stone-50/80 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-gray-200">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-stone-50/80 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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

          <div className="pt-3 text-center text-xs text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-gray-800">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
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
