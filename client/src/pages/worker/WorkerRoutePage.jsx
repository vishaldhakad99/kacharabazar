import React, { useState, useEffect } from 'react';
import {
  Compass,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Truck,
  Play,
  Check,
  Camera,
  Upload,
  X,
  Sparkles,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import api from '../../api/client';
import useAuthStore from '../../store/useAuthStore';
import { createStopIcon, createTruckIcon } from '../../utils/leafletIcons';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export const WorkerRoutePage = () => {
  const { user } = useAuthStore();
  const [routes, setRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verification modal state
  const [selectedStop, setSelectedStop] = useState(null);
  const [segregation, setSegregation] = useState('correct');
  const [workerNotes, setWorkerNotes] = useState('');
  const [verificationPhoto, setVerificationPhoto] = useState('');
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fetchRoutes = async () => {
    try {
      const res = await api.get('/routes');
      if (res.success && res.routes) {
        setRoutes(res.routes);
        const current = res.routes.find((r) => r.status === 'in_progress') || res.routes[0];
        setActiveRoute(current || null);
      }
    } catch (err) {
      toast.error('Failed to load today\'s routes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleStartRoute = async () => {
    if (!activeRoute) return;
    try {
      const res = await api.patch(`/routes/${activeRoute._id}`, { status: 'in_progress' });
      if (res.success) {
        toast.success('Route started! Real-time telemetry broadcasting.');
        fetchRoutes();
      }
    } catch (err) {
      // Handled
    }
  };

  const handleUpdateStopStatus = async (stopId, status) => {
    if (!activeRoute) return;
    try {
      const res = await api.patch(`/routes/${activeRoute._id}/stops/${stopId}`, { status });
      if (res.success) {
        toast.success(`Stop marked as ${status}.`);
        fetchRoutes();
      }
    } catch (err) {
      // Handled
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.success && res.url) {
        setVerificationPhoto(res.url);
        toast.success('Verification photo attached.');
      }
    } catch (err) {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedStop?.request?._id && !selectedStop?.request) {
      // Generic stop completion if not linked to a citizen pickup request
      await handleUpdateStopStatus(selectedStop._id, 'completed');
      setSelectedStop(null);
      return;
    }

    const pickupId = selectedStop.request._id || selectedStop.request;

    setVerifying(true);
    try {
      const res = await api.post(`/pickups/${pickupId}/verify`, {
        segregation,
        workerNotes,
        verificationPhoto,
      });

      if (res.success) {
        toast.success(
          `Stop verified! ${res.pointsAwarded} eco-points credited to citizen.`
        );
        // Also mark stop completed in route
        await handleUpdateStopStatus(selectedStop._id, 'completed');
        setSelectedStop(null);
        setWorkerNotes('');
        setVerificationPhoto('');
        fetchRoutes();
      }
    } catch (err) {
      // Handled
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  if (!activeRoute) {
    return (
      <div className="p-8 text-center text-xs text-muted rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        No collection route assigned to your profile today.
      </div>
    );
  }

  const completedCount = activeRoute.stops.filter((s) => s.status === 'completed').length;
  const totalCount = activeRoute.stops.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const polylinePositions = activeRoute.stops
    .filter((s) => s.location?.coordinates)
    .map((s) => [s.location.coordinates[1], s.location.coordinates[0]]);

  const mapCenter = polylinePositions[0] || [23.2599, 77.4126];

  return (
    <div className="space-y-6">
      {/* Route Title & Start action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
            Today's Doorstep Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
            <Compass className="w-7 h-7 text-primary-600" />
            {activeRoute.name}
          </h1>
          <p className="text-xs text-muted">
            Vehicle: <strong>{activeRoute.vehicle?.regNumber || 'MP04-EA-1037'}</strong> • Ward:{' '}
            <strong>{activeRoute.ward?.name}</strong>
          </p>
        </div>

        {activeRoute.status === 'scheduled' && (
          <button
            onClick={handleStartRoute}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" /> Start Route Now
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-ink dark:text-white">Route Progress</span>
          <span className="text-primary-600 dark:text-primary-400">
            {completedCount} / {totalCount} Stops Completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Map of Route Stops */}
      <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        <div className="h-72 sm:h-80 w-full">
          <MapContainer center={mapCenter} zoom={14} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {polylinePositions.length > 1 && (
              <Polyline
                positions={polylinePositions}
                color="#1E7A46"
                weight={4}
                opacity={0.8}
                dashArray="6, 8"
              />
            )}
            {activeRoute.stops.map((stop, index) => {
              if (!stop.location?.coordinates) return null;
              return (
                <Marker
                  key={stop._id || index}
                  position={[stop.location.coordinates[1], stop.location.coordinates[0]]}
                  icon={createStopIcon(stop.order, stop.status)}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <p className="font-bold">Stop #{stop.order}</p>
                      <p className="text-muted">{stop.address}</p>
                      <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100">
                        {stop.status}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Ordered Stops List */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-sm text-ink dark:text-white">
          Ordered Stops & Verification Tasks
        </h3>

        <div className="space-y-3">
          {activeRoute.stops.map((stop) => {
            const isDone = stop.status === 'completed';
            const isReached = stop.status === 'reached';

            return (
              <div
                key={stop._id}
                className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-gray-50/70 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800 opacity-80'
                    : isReached
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900 shadow-sm'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isReached
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-ink dark:text-white'
                    }`}
                  >
                    {isDone ? '✓' : stop.order}
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-sm text-ink dark:text-white">
                      {stop.address}
                    </h4>
                    <p className="text-xs text-muted">
                      {stop.request
                        ? `Citizen Pickup (${stop.request.wasteType || 'General'} Waste)`
                        : 'Community Bin Collection Stop'}
                    </p>
                  </div>
                </div>

                {/* Stop Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!isDone && (
                    <>
                      {stop.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStopStatus(stop._id, 'reached')}
                          className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors"
                        >
                          Mark Arrived
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedStop(stop)}
                        className="px-4 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" /> Verify & Complete
                      </button>
                    </>
                  )}

                  {isDone && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Verified & Collected
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verification Sheet Modal */}
      {selectedStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary-600">
                  Doorstep Verification Sheet
                </span>
                <h3 className="font-heading font-black text-lg text-ink dark:text-white">
                  Stop #{selectedStop.order} • Quality Check
                </h3>
              </div>
              <button
                onClick={() => setSelectedStop(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              {/* Segregation radio options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Segregation Quality *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => setSegregation('correct')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                      segregation === 'correct'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-gray-200 dark:border-gray-800 text-muted'
                    }`}
                  >
                    <span className="block text-xs">100% Correct</span>
                    <span className="text-[10px] text-emerald-600 font-bold">+20 pts</span>
                  </div>

                  <div
                    onClick={() => setSegregation('partial')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                      segregation === 'partial'
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-bold'
                        : 'border-gray-200 dark:border-gray-800 text-muted'
                    }`}
                  >
                    <span className="block text-xs">Partial</span>
                    <span className="text-[10px] text-sky-600 font-bold">+10 pts</span>
                  </div>

                  <div
                    onClick={() => setSegregation('none')}
                    className={`p-3 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                      segregation === 'none'
                        ? 'border-gray-500 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold'
                        : 'border-gray-200 dark:border-gray-800 text-muted'
                    }`}
                  >
                    <span className="block text-xs">Mixed / None</span>
                    <span className="text-[10px] text-gray-500 font-bold">0 pts</span>
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Optional Verification Photo
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold cursor-pointer inline-flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary-600" />
                    <span>{uploading ? 'Uploading...' : 'Take Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {verificationPhoto && (
                    <span className="text-xs text-emerald-600 font-bold">Attached ✓</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
                  Worker Inspection Notes
                </label>
                <input
                  type="text"
                  value={workerNotes}
                  onChange={(e) => setWorkerNotes(e.target.value)}
                  placeholder="e.g. Proper green & blue bin separation."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStop(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {verifying ? 'Verifying...' : 'Verify & Credit Points'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerRoutePage;
