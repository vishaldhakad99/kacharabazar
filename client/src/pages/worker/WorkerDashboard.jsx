import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Truck,
  ShieldCheck,
  AlertTriangle,
  LifeBuoy,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../api/client';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const WorkerDashboard = () => {
  const { user } = useAuthStore();
  const [routes, setRoutes] = useState([]);
  const [pendingPickups, setPendingPickups] = useState([]);
  const [dumps, setDumps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, pickupsRes, dumpsRes] = await Promise.all([
          api.get('/routes'),
          api.get('/pickups?status=assigned&limit=5'),
          api.get('/dumps?status=assigned&limit=5'),
        ]);

        if (routesRes.success) setRoutes(routesRes.routes || []);
        if (pickupsRes.success) setPendingPickups(pickupsRes.pickups || []);
        if (dumpsRes.success) setDumps(dumpsRes.dumps || []);
      } catch (err) {
        // Handled
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeRoute = routes.find((r) => r.status === 'in_progress') || routes[0];
  const completedStops = activeRoute?.stops?.filter((s) => s.status === 'completed')?.length || 0;
  const totalStops = activeRoute?.stops?.length || 0;
  const progressPercent = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Sanitation Field Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white">
            Worker Portal • {user?.name}
          </h1>
          <p className="text-xs text-muted">
            Assigned Ward: <strong>{user?.ward?.name || 'Bhopal Central'}</strong> • Pilot City: Bhopal Municipal Corporation (BMC)
          </p>
        </div>

        <Link
          to="/worker/route"
          className="self-start sm:self-auto px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Compass className="w-4 h-4" /> Open Today's Route
        </Link>
      </div>

      {/* Route Progress Overview Card */}
      {activeRoute ? (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-primary-900 to-primary-800 text-white shadow-soft-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs text-primary-200 font-semibold uppercase tracking-wider">
                Active Collection Route
              </span>
              <h2 className="text-xl font-heading font-bold text-white">
                {activeRoute.name}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              {activeRoute.status.replace('_', ' ')}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-primary-200 font-medium">
              <span>Collection Progress</span>
              <span>
                {completedStops} / {totalStops} Stops Completed ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-black/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-accent-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-white/10">
            <span className="text-primary-200 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-accent-400" />
              Vehicle: <strong>{activeRoute.vehicle?.regNumber || 'MP04-EA-1037'}</strong>
            </span>
            <Link
              to="/worker/route"
              className="px-4 py-2 rounded-xl bg-white text-primary-900 hover:bg-primary-50 font-bold transition-all shadow-sm"
            >
              Resume Route Map
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm text-center py-8">
          <Compass className="w-8 h-8 mx-auto text-primary-600 mb-2" />
          <h3 className="font-heading font-bold text-base text-ink dark:text-white">
            No Scheduled Routes
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto mt-1">
            All stops for today are completed or await administrator dispatch.
          </p>
        </div>
      )}

      {/* Field Actions Quick Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/worker/route"
          className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-3">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-ink dark:text-white">
              Doorstep Route Stops
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Verify segregation & credit points to citizens
            </p>
          </div>
        </Link>

        <Link
          to="/worker/dumps"
          className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-amber-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-ink dark:text-white">
              Clear Dump Hotspots
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Upload after-photos and mark areas clean ({dumps.length} assigned)
            </p>
          </div>
        </Link>

        <Link
          to="/worker/issues"
          className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-red-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950 text-red-600 flex items-center justify-center mb-3">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-ink dark:text-white">
              Report Route Obstruction
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Blocked roads, overflowing bins, or mechanical issues
            </p>
          </div>
        </Link>
      </div>

      {/* Pending Doorstep Requests in Ward */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-base text-ink dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          On-Demand Citizen Pickups in Ward
        </h3>

        {loading ? (
          <LoadingSkeleton count={2} />
        ) : pendingPickups.length === 0 ? (
          <p className="text-xs text-muted py-4 text-center">
            No pending on-demand citizen requests in your ward right now.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {pendingPickups.map((pickup) => (
              <div
                key={pickup._id}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-ink dark:text-white capitalize block">
                    {pickup.citizen?.name} • {pickup.wasteType} Waste
                  </span>
                  <span className="text-[11px] text-muted">{pickup.address}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                    {pickup.status}
                  </span>
                  <Link
                    to="/worker/route"
                    className="px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs"
                  >
                    View on Route
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;
