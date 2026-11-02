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
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          {isAuthenticated && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-ink dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-800 to-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-700/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="font-heading font-black text-lg tracking-tight text-primary-900 dark:text-white leading-none block">
                Kachra <span className="text-accent-500">Bazar</span>
              </span>
              <span className="text-[10px] font-semibold text-muted tracking-wider uppercase block">
                Smart Waste • Bhopal
              </span>
            </div>
          </Link>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Public links when not logged in */}
          {!isAuthenticated && (
            <div className="hidden sm:flex items-center gap-4 mr-2 text-xs font-semibold">
              <Link to="/" className="text-ink dark:text-gray-300 hover:text-primary-600">
                Home
              </Link>
              <Link to="/about" className="text-ink dark:text-gray-300 hover:text-primary-600">
                About & Team
              </Link>
              <a href="#hotspot-map" className="text-ink dark:text-gray-300 hover:text-primary-600">
                City Hotspots
              </a>
            </div>
          )}

          {/* Eco-Points Pill for logged in citizens */}
          {isAuthenticated && user?.role === 'citizen' && (
            <Link
              to="/dashboard/points"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-950/60 border border-accent-200 dark:border-accent-900 text-accent-700 dark:text-accent-300 text-xs font-bold hover:shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              <span>{user.ecoBalance || 0} pts</span>
            </Link>
          )}

          {/* Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-ink dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Notification Bell (authenticated) */}
          {isAuthenticated && <NotificationBell />}

          {/* Auth CTA or User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-1 border-l border-gray-200 dark:border-gray-800">
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center border border-primary-200 dark:border-primary-800">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-bold text-ink dark:text-white leading-tight">
                    {user.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] capitalize text-primary-600 dark:text-primary-400 font-semibold">
                    {user.role}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md transition-all active:scale-95"
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
