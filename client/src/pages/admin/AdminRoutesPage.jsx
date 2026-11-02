import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Truck,
  User,
  MapPin,
  CheckCircle2,
  Clock,
  Play,
  X,
  Trash2,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import api from '../../api/client';
import { createStopIcon } from '../../utils/leafletIcons';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

// Leaflet click handler to add stops interactively
const AddStopsMapClick = ({ onAddStop }) => {
  useMapEvents({
    click(e) {
      onAddStop([e.latlng.lng, e.latlng.lat]);
    },
  });
  return null;
};

export const AdminRoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [wards, setWards] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create route modal state
  const [createModal, setCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [ward, setWard] = useState('');
  const [worker, setWorker] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [pickedStops, setPickedStops] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, wRes, uRes, vRes] = await Promise.all([
        api.get('/routes'),
        api.get('/wards'),
        api.get('/users?role=worker&limit=50'),
        api.get('/vehicles?limit=50'),
      ]);
      if (rRes.success) setRoutes(rRes.routes || []);
      if (wRes.success) {
        setWards(wRes.wards || []);
        if (wRes.wards?.length > 0) setWard(wRes.wards[0]._id);
      }
      if (uRes.success) {
        setWorkers(uRes.users || []);
        if (uRes.users?.length > 0) setWorker(uRes.users[0]._id);
      }
      if (vRes.success) {
        setVehicles(vRes.vehicles || []);
        if (vRes.vehicles?.length > 0) setVehicle(vRes.vehicles[0]._id);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStopCoord = (coords) => {
    setPickedStops((prev) => [
      ...prev,
      {
        order: prev.length + 1,
        coordinates: coords,
        address: `Way-Stop #${prev.length + 1} (${coords[1].toFixed(4)}, ${coords[0].toFixed(4)})`,
      },
    ]);
    toast.success(`Stop #${pickedStops.length + 1} pinned!`);
  };

  const handleRemoveStop = (idx) => {
    setPickedStops((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, order: i + 1, address: `Way-Stop #${i + 1}` }))
    );
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a route name.');
      return;
    }
    if (pickedStops.length < 2) {
      toast.error('Please pick at least 2 stops on the map.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/routes', {
        name,
        ward,
        worker,
        vehicle,
        stops: pickedStops,
      });

      if (res.success) {
        toast.success('Collection route dispatched successfully!');
        setCreateModal(false);
        setName('');
        setPickedStops([]);
        fetchData();
      }
    } catch (err) {
      // Handled
    } finally {
      setSaving(false);
    }
  };

  const bhopalCenter = [23.2599, 77.4126];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
            Route Dispatch Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
            <Compass className="w-7 h-7 text-primary-600" />
            Collection Routes ({routes.length})
          </h1>
          <p className="text-xs text-muted">
            Design multi-stop collection routes on an interactive map and assign vehicles.
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="self-start sm:self-auto px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Route on Map
        </button>
      </div>

      {/* Routes Grid */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : routes.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          No collection routes created yet. Click "Create Route on Map" to author a new route.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {routes.map((route) => {
            const completedStops = route.stops.filter((s) => s.status === 'completed').length;
            const totalStops = route.stops.length;
            const progress = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;

            return (
              <div
                key={route._id}
                className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400">
                      {route.ward?.name || 'Bhopal Ward'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        route.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : route.status === 'in_progress'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {route.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-ink dark:text-white">
                    {route.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-muted">
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-accent-500" />
                      <span>
                        Vehicle: <strong>{route.vehicle?.regNumber || 'Unassigned'}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-primary-600" />
                      <span>
                        Worker: <strong>{route.worker?.name || 'Unassigned'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-3 border-t border-gray-50 dark:border-gray-800">
                  <div className="flex justify-between text-[11px] font-semibold text-muted">
                    <span>Stops Progress</span>
                    <span>
                      {completedStops} / {totalStops} ({progress}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Route Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl my-8 p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary-600">
                  Interactive Route Planner
                </span>
                <h3 className="font-heading font-black text-lg text-ink dark:text-white">
                  Map-Based Route Authoring
                </h3>
              </div>
              <button
                onClick={() => setCreateModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-muted mb-1">
                    Route Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Morning Line 2 - Arera E3"
                    required
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-muted mb-1">
                    Ward *
                  </label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                  >
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-muted mb-1">
                    Assign Collection Vehicle
                  </label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                  >
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.regNumber} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-muted mb-1">
                    Assign Sanitation Worker
                  </label>
                  <select
                    value={worker}
                    onChange={(e) => setWorker(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                  >
                    {workers.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({w.ward?.name || 'Worker'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive Leaflet Map for Pinning Stops */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold uppercase text-muted">
                    Click on Map to Add Route Stops ({pickedStops.length} added)
                  </label>
                  <span className="text-[11px] text-primary-600 font-semibold">
                    Click roads in sequence
                  </span>
                </div>

                <div className="h-56 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <MapContainer center={bhopalCenter} zoom={13} className="h-full w-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <AddStopsMapClick onAddStop={handleAddStopCoord} />
                    {pickedStops.map((stop, idx) => (
                      <Marker
                        key={idx}
                        position={[stop.coordinates[1], stop.coordinates[0]]}
                        icon={createStopIcon(stop.order, 'pending')}
                      />
                    ))}
                  </MapContainer>
                </div>
              </div>

              {/* Pinned Stops List */}
              {pickedStops.length > 0 && (
                <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                  {pickedStops.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                    >
                      <span>
                        #{s.order}: {s.address}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || pickedStops.length < 2}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold shadow-md"
                >
                  {saving ? 'Creating...' : 'Save & Dispatch Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoutesPage;
