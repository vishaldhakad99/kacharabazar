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
  MapPin,
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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-50 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-stone-200/70 dark:border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-4">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-stone-100 dark:border-gray-800">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {role} Navigation
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Ward info badge */}
          {user?.ward && (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/60 dark:border-emerald-900/50 shadow-sm">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>Assigned Ward</span>
              </div>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 truncate block mt-0.5">
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
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-bold translate-x-1'
                        : 'text-stone-600 dark:text-gray-300 hover:bg-stone-100/70 dark:hover:bg-gray-800/60 hover:text-stone-900 dark:hover:text-white hover:translate-x-0.5'
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
        <div className="p-4 border-t border-stone-200/60 dark:border-gray-800 bg-stone-50/60 dark:bg-gray-800/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Kachra Bazar
              </p>
              <p className="text-[10px] text-stone-500 dark:text-gray-400 mt-0.5">
                SIRTE Bhopal • Major Project
              </p>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-gray-700 text-stone-600 dark:text-gray-300 font-semibold">
              v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
