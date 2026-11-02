import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  Truck,
  Gift,
  Coins,
  Compass,
  AlertTriangle,
  LifeBuoy,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

export const BottomNav = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'citizen';

  const citizenTabs = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/dashboard/pickups/new', label: 'Request', icon: CalendarPlus },
    { to: '/dashboard/track', label: 'Track', icon: Truck },
    { to: '/dashboard/rewards', label: 'Bazar', icon: Gift },
    { to: '/dashboard/points', label: 'Worth', icon: Coins },
  ];

  const workerTabs = [
    { to: '/worker', label: 'Home', icon: LayoutDashboard },
    { to: '/worker/route', label: 'Route', icon: Compass },
    { to: '/worker/dumps', label: 'Dumps', icon: AlertTriangle },
    { to: '/worker/issues', label: 'Issue', icon: LifeBuoy },
  ];

  const adminTabs = [
    { to: '/admin', label: 'KPIs', icon: LayoutDashboard },
    { to: '/admin/map', label: 'Fleet', icon: Truck },
    { to: '/admin/pickups', label: 'Pickups', icon: CalendarPlus },
    { to: '/admin/dumps', label: 'Dumps', icon: AlertTriangle },
  ];

  const tabs = role === 'admin' ? adminTabs : role === 'worker' ? workerTabs : citizenTabs;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-100 dark:border-gray-800 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/dashboard' || tab.to === '/worker' || tab.to === '/admin'}
              className={({ isActive }) =>
                `flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-ink'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
