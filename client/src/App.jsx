import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import useAuthStore from './store/useAuthStore';
import useThemeStore from './store/useThemeStore';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import CitizenPickupsPage from './pages/citizen/CitizenPickupsPage';
import CreatePickupPage from './pages/citizen/CreatePickupPage';
import PickupDetailPage from './pages/citizen/PickupDetailPage';
import CitizenTrackPage from './pages/citizen/CitizenTrackPage';
import ReportDumpPage from './pages/citizen/ReportDumpPage';
import RewardsBazarPage from './pages/citizen/RewardsBazarPage';
import PointsHistoryPage from './pages/citizen/PointsHistoryPage';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerRoutePage from './pages/worker/WorkerRoutePage';
import WorkerDumpsPage from './pages/worker/WorkerDumpsPage';
import WorkerReportIssuePage from './pages/worker/WorkerReportIssuePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLiveMapPage from './pages/admin/AdminLiveMapPage';
import AdminPickupsPage from './pages/admin/AdminPickupsPage';
import AdminDumpsPage from './pages/admin/AdminDumpsPage';
import AdminRoutesPage from './pages/admin/AdminRoutesPage';
import AdminVehiclesPage from './pages/admin/AdminVehiclesPage';
import AdminWardsPage from './pages/admin/AdminWardsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRewardsPage from './pages/admin/AdminRewardsPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminIssuesPage from './pages/admin/AdminIssuesPage';

function App() {
  const { checkAuth } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1F2937',
            color: '#FFFFFF',
            fontSize: '13px',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes with standard Layout (Navbar + Footer, no Sidebar) */}
        <Route element={<AppLayout requireAuth={false} />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Universal Protected Profile Route */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout requireAuth={true} />
            </ProtectedRoute>
          }
        >
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Citizen Portal Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <AppLayout requireAuth={true} />
            </ProtectedRoute>
          }
        >
          <Route index element={<CitizenDashboard />} />
          <Route path="pickups" element={<CitizenPickupsPage />} />
          <Route path="pickups/new" element={<CreatePickupPage />} />
          <Route path="pickups/:id" element={<PickupDetailPage />} />
          <Route path="track" element={<CitizenTrackPage />} />
          <Route path="dumps/new" element={<ReportDumpPage />} />
          <Route path="rewards" element={<RewardsBazarPage />} />
          <Route path="points" element={<PointsHistoryPage />} />
        </Route>

        {/* Worker Portal Routes */}
        <Route
          path="/worker"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <AppLayout requireAuth={true} />
            </ProtectedRoute>
          }
        >
          <Route index element={<WorkerDashboard />} />
          <Route path="route" element={<WorkerRoutePage />} />
          <Route path="dumps" element={<WorkerDumpsPage />} />
          <Route path="issues" element={<WorkerReportIssuePage />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout requireAuth={true} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="map" element={<AdminLiveMapPage />} />
          <Route path="pickups" element={<AdminPickupsPage />} />
          <Route path="dumps" element={<AdminDumpsPage />} />
          <Route path="routes" element={<AdminRoutesPage />} />
          <Route path="vehicles" element={<AdminVehiclesPage />} />
          <Route path="wards" element={<AdminWardsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="rewards" element={<AdminRewardsPage />} />
          <Route path="announcements" element={<AdminAnnouncementsPage />} />
          <Route path="issues" element={<AdminIssuesPage />} />
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
