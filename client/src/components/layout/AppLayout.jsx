import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import useAuthStore from '../../store/useAuthStore';

export const AppLayout = ({ requireAuth = true }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const showSidebar = requireAuth && isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-950 text-ink dark:text-gray-100 transition-colors">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex w-full">
        {showSidebar && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main
          className={`flex-1 w-full transition-all duration-300 pb-20 lg:pb-12 ${
            showSidebar ? 'lg:pl-64' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {showSidebar && <BottomNav />}
      {!showSidebar && <Footer />}
    </div>
  );
};

export default AppLayout;
