import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  Truck,
  AlertTriangle,
  Gift,
  Coins,
  Map,
  Users,
  Compass,
  FileSpreadsheet,
  Megaphone,
  LifeBuoy,
  ClipboardList,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const role = user?.role || 'citizen';

  const citizenNav = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dashboard/pickups/new', label: 'Request Pickup', icon: CalendarPlus },
    { to: '/dashboard/pickups', label: 'My Requests', icon: ClipboardList },
    { to: '/dashboard/track', label: 'Live Truck Tracking', icon: Truck },
    { to: '/dashboard/dumps/new', label: 'Report Dump Hotspot', icon: AlertTriangle },
    { to: '/dashboard/rewards', label: 'Rewards Bazar', icon: Gift },
    { to: '/dashboard/points', label: 'My Points & Worth', icon: Coins },
  ];

  const workerNav = [
    { to: '/worker', label: 'Worker Home', icon: LayoutDashboard },
    { to: '/worker/route', label: "Today's Route & Stops", icon: Compass },
    { to: '/worker/dumps', label: 'Dump Clearances', icon: AlertTriangle },
    { to: '/worker/issues', label: 'Report Route Issue', icon: LifeBuoy },
  ];

  const adminNav = [
    { to: '/admin', label: 'KPIs & Analytics', icon: LayoutDashboard },
    { to: '/admin/map', label: 'Live City Fleet Map', icon: Map },
    { to: '/admin/pickups', label: 'Pickup Requests', icon: ClipboardList },
    { to: '/admin/dumps', label: 'Dump Hotspots', icon: AlertTriangle },
    { to: '/admin/routes', label: 'Route Dispatcher', icon: Compass },
    { to: '/admin/vehicles', label: 'Vehicle Fleet', icon: Truck },
    { to: '/admin/wards', label: 'Bhopal Wards', icon: Map },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/rewards', label: 'Rewards & Coupons', icon: Gift },
    { to: '/admin/announcements', label: 'Civic Notices', icon: Megaphone },
    { to: '/admin/issues', label: 'Field Issues', icon: LifeBuoy },
  ];

  let navItems = citizenNav;
  if (role === 'worker') navItems = workerNav;
  if (role === 'admin') navItems = adminNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              {role} Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-ink dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Ward info badge */}
          {user?.ward && (
            <div className="px-3.5 py-2.5 rounded-2xl bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-900">
              <span className="text-[10px] uppercase font-bold text-primary-700 dark:text-primary-300 block">
                Assigned Ward
              </span>
              <span className="text-xs font-bold text-primary-900 dark:text-primary-100 truncate block">
                {user.ward.name || 'Bhopal Central'}
              </span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard' || item.to === '/worker' || item.to === '/admin'}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20 font-bold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-ink dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Project Info Note */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
          <p className="text-[10px] font-bold text-primary-800 dark:text-primary-300 uppercase tracking-wider">
            Kachra Bazar v1.0
          </p>
          <p className="text-[10px] text-muted dark:text-gray-400">
            SIRTE Bhopal • Major Project
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
