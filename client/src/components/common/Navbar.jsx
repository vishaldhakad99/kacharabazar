import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Recycle, User, LogOut, ShieldAlert, Sparkles, Menu } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import NotificationBell from './NotificationBell';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'worker') return '/worker';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/70 dark:border-gray-800/80 glass-header transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          {isAuthenticated && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-stone-700 dark:text-gray-200 hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors active:scale-95"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-800/25 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-emerald-800/30 transition-all duration-300">
              <Recycle className="w-5 h-5 text-emerald-200 group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <div>
              <span className="font-heading font-black text-lg tracking-tight text-stone-900 dark:text-white leading-none block">
                Kachra <span className="text-amber-500">Bazar</span>
              </span>
              <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 tracking-wider uppercase block">
                Smart Waste • Bhopal
              </span>
            </div>
          </Link>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Public links when not logged in */}
          {!isAuthenticated && (
            <div className="hidden sm:flex items-center gap-5 mr-3 text-xs font-semibold">
              <Link to="/" className="text-stone-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-stone-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                About & Team
              </Link>
              <a href="#hotspot-map" className="text-stone-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                City Hotspots
              </a>
            </div>
          )}

          {/* Eco-Points Pill for logged in citizens */}
          {isAuthenticated && user?.role === 'citizen' && (
            <Link
              to="/dashboard/points"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/50 border border-amber-200/80 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-sm hover:shadow hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{user.ecoBalance || 0} <span className="font-medium text-[10px]">pts</span></span>
            </Link>
          )}

          {/* Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-stone-600 dark:text-gray-200 hover:bg-stone-100 dark:hover:bg-gray-800 transition-all active:scale-90"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Notification Bell (authenticated) */}
          {isAuthenticated && <NotificationBell />}

          {/* Auth CTA or User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-gray-800">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-gray-800 text-left transition-all active:scale-95"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-bold text-stone-900 dark:text-white leading-tight">
                    {user.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] capitalize text-emerald-600 dark:text-emerald-400 font-semibold">
                    {user.role}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-90"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-gray-200 hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all active:scale-95"
              >
                Join Clean City
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
