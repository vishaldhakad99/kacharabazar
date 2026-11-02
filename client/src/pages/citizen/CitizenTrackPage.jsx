import React, { useState, useEffect } from 'react';
import { Truck, Navigation, Clock, ShieldCheck, MapPin } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../api/client';
import LiveTrackingMap from '../../components/common/LiveTrackingMap';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const CitizenTrackPage = () => {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const wardId = user?.ward?._id || user?.ward;
        const [vehRes, routeRes] = await Promise.all([
          api.get(`/vehicles${wardId ? `?ward=${wardId}` : ''}`),
          api.get(`/routes?status=in_progress${wardId ? `&ward=${wardId}` : ''}`),
        ]);

        if (vehRes.success) setVehicles(vehRes.vehicles || []);
        if (routeRes.success && routeRes.routes?.length > 0) {
          setActiveRoute(routeRes.routes[0]);
        }
      } catch (err) {
        // Ignore
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [user]);

  const citizenCoords = user?.ward?.center?.coordinates || [77.4334, 23.2332];
  const primaryVehicle = vehicles.find((v) => v.status === 'on_route') || vehicles[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
          Real-Time Fleet Telemetry
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
          <Truck className="w-7 h-7 text-primary-600" />
          Track Ward Collection Vehicle
        </h1>
        <p className="text-xs text-muted">
          Broadcasting live GPS positions from the Bhopal Municipal Corporation (BMC) door-to-door fleet.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={2} />
      ) : (
        <div className="space-y-6">
          {/* Live Map */}
          <LiveTrackingMap
            wardId={user?.ward?._id || user?.ward}
            citizenCoords={citizenCoords}
            routeStops={activeRoute?.stops || []}
            vehicleInitial={primaryVehicle}
          />

          {/* Route & Vehicle Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted">Active Vehicle</span>
              <p className="text-lg font-heading font-extrabold text-ink dark:text-white">
                {primaryVehicle ? primaryVehicle.regNumber : 'MP04-EA-1037'}
              </p>
              <p className="text-xs text-muted capitalize">
                Type: {primaryVehicle ? primaryVehicle.type.replace('_', ' ') : 'Tipper Truck'}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted">Assigned Route</span>
              <p className="text-lg font-heading font-extrabold text-ink dark:text-white truncate">
                {activeRoute ? activeRoute.name : 'Morning Line 1 - Ward Route'}
              </p>
              <p className="text-xs text-emerald-600 font-semibold">
                Status: {activeRoute?.status || 'Active On Route'}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted">Smart 500m Alert</span>
              <p className="text-lg font-heading font-extrabold text-accent-600">
                Automatic Push
              </p>
              <p className="text-xs text-muted">
                You receive a sound chime & notification when truck is within 500 meters.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenTrackPage;
