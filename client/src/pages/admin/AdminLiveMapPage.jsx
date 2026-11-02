import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Truck, Navigation, Filter, MapPin, Gauge } from 'lucide-react';
import api from '../../api/client';
import { getSocket } from '../../services/socket';
import { createTruckIcon } from '../../utils/leafletIcons';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const AdminLiveMapPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedWard, setSelectedWard] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFleet = async () => {
    try {
      const [vehRes, wardRes] = await Promise.all([
        api.get(`/vehicles${selectedWard ? `?ward=${selectedWard}` : ''}`),
        api.get('/wards'),
      ]);
      if (vehRes.success) setVehicles(vehRes.vehicles || []);
      if (wardRes.success) setWards(wardRes.wards || []);
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, [selectedWard]);

  // Listen for live vehicle location socket broadcasts
  useEffect(() => {
    const socket = getSocket();

    const handleLocationUpdate = (data) => {
      if (data?.vehicleId && data?.coordinates) {
        setVehicles((prev) =>
          prev.map((v) =>
            v._id === data.vehicleId
              ? {
                  ...v,
                  currentLocation: {
                    type: 'Point',
                    coordinates: data.coordinates,
                  },
                  speed: data.speed,
                  status: 'on_route',
                }
              : v
          )
        );
      }
    };

    socket.on('vehicle:location', handleLocationUpdate);

    return () => {
      socket.off('vehicle:location', handleLocationUpdate);
    };
  }, []);

  const bhopalCenter = [23.2599, 77.4126];

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
            City Fleet Telemetry
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
            <Truck className="w-7 h-7 text-primary-600" />
            Live Municipal Fleet Map
          </h1>
          <p className="text-xs text-muted">
            Tracking 12 municipal collection vehicles across 8 Bhopal wards in real-time.
          </p>
        </div>

        {/* Ward Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
          >
            <option value="">All Bhopal Wards</option>
            {wards.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Full-Width Map */}
          <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-soft-lg bg-surface dark:bg-gray-900">
            <div className="h-[480px] w-full">
              <MapContainer center={bhopalCenter} zoom={13} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {vehicles.map((v) => {
                  if (!v.currentLocation?.coordinates) return null;
                  const [lng, lat] = v.currentLocation.coordinates;
                  const isMoving = v.status === 'on_route';

                  return (
                    <Marker
                      key={v._id}
                      position={[lat, lng]}
                      icon={createTruckIcon(v.regNumber, isMoving)}
                    >
                      <Popup>
                        <div className="text-xs p-1">
                          <p className="font-heading font-black text-sm text-primary-900">
                            {v.regNumber}
                          </p>
                          <p className="text-muted capitalize">
                            Type: {v.type.replace('_', ' ')}
                          </p>
                          <p className="text-muted">Ward: {v.ward?.name}</p>
                          <p className="mt-1 font-bold text-accent-600">
                            Status: {v.status.replace('_', ' ')}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* Vehicle Fleet Cards Sidebar */}
          <div className="lg:col-span-4 space-y-3 max-h-[480px] overflow-y-auto pr-1">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-muted">
              Live Vehicles ({vehicles.length})
            </h3>

            {vehicles.map((v) => (
              <div
                key={v._id}
                className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-ink dark:text-white">
                      {v.regNumber}
                    </h4>
                    <p className="text-[11px] text-muted">{v.ward?.name || 'Bhopal Ward'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      v.status === 'on_route'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {v.status.replace('_', ' ')}
                  </span>
                  <span className="block text-[10px] text-muted mt-0.5">
                    Cap: {v.capacityKg} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveMapPage;
