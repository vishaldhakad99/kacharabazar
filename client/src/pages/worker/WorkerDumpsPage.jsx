import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Camera,
  Upload,
  ArrowRight,
  ShieldCheck,
  MapPin,
  X,
} from 'lucide-react';
import api from '../../api/client';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export const WorkerDumpsPage = () => {
  const [dumps, setDumps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDump, setSelectedDump] = useState(null);
  const [photoAfter, setPhotoAfter] = useState('');
  const [workerNotes, setWorkerNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);

  const fetchDumps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dumps?status=assigned');
      if (res.success) {
        setDumps(res.dumps || []);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDumps();
  }, []);

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
        setPhotoAfter(res.url);
        toast.success('Cleaned after-photo uploaded.');
      }
    } catch (err) {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleClearSubmit = async (e) => {
    e.preventDefault();
    if (!photoAfter) {
      toast.error('Please upload an after-photo verifying the hotspot is cleared.');
      return;
    }

    setClearing(true);
    try {
      const res = await api.patch(`/dumps/${selectedDump._id}/clear`, {
        photoAfter,
        workerNotes,
      });

      if (res.success) {
        toast.success('Hotspot cleared! +30 bonus points credited to citizen.');
        setSelectedDump(null);
        setPhotoAfter('');
        setWorkerNotes('');
        fetchDumps();
      }
    } catch (err) {
      // Handled
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Field Clearance Tasks
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
          Assigned Dump Hotspots
        </h1>
        <p className="text-xs text-muted">
          Clear illegal roadside garbage piles reported by citizens in your ward. Uploading an after-photo
          awards +30 bonus eco-points to the reporting citizen.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : dumps.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          No dump clearance tasks assigned to you right now. Great job keeping the ward clean!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dumps.map((dump) => (
            <div
              key={dump._id}
              className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      dump.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : dump.severity === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {dump.severity} Severity
                  </span>
                  <span className="text-xs text-muted">
                    Reported by {dump.reporter?.name?.split(' ')[0] || 'Citizen'}
                  </span>
                </div>

                <div className="flex gap-3">
                  {dump.photoBefore && (
                    <img
                      src={dump.photoBefore}
                      alt="Before"
                      className="w-20 h-20 object-cover rounded-2xl border border-gray-200 shadow-sm flex-shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="font-heading font-bold text-sm text-ink dark:text-white line-clamp-2">
                      {dump.description}
                    </h3>
                    <p className="text-xs text-muted mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                      <span className="truncate">{dump.address || 'Ward Roadside Spot'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[11px] text-muted">
                  Ward: <strong>{dump.ward?.name}</strong>
                </span>

                <button
                  onClick={() => setSelectedDump(dump)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark as Cleared
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Dump Modal */}
      {selectedDump && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600">
                  Verification of Clearance
                </span>
                <h3 className="font-heading font-black text-lg text-ink dark:text-white">
                  Mark Hotspot Cleaned
                </h3>
              </div>
              <button
                onClick={() => setSelectedDump(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClearSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                  Required "After" Cleanup Photo *
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold cursor-pointer inline-flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>{uploading ? 'Uploading...' : 'Take Cleaned Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {photoAfter && (
                    <div className="flex items-center gap-2">
                      <img
                        src={photoAfter}
                        alt="After"
                        className="w-12 h-12 object-cover rounded-xl border border-emerald-500"
                      />
                      <span className="text-xs text-emerald-600 font-bold">Attached ✓</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
                  Worker Resolution Notes
                </label>
                <textarea
                  value={workerNotes}
                  onChange={(e) => setWorkerNotes(e.target.value)}
                  placeholder="e.g. Cleared 250 kg garbage. Sprayed disinfectant powder."
                  rows={2}
                  className="w-full p-3 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="p-3 rounded-2xl bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-900 text-[11px] text-accent-800 dark:text-accent-300">
                ⭐ <strong>Bonus Alert</strong>: Marking this dump cleared will automatically credit{' '}
                <strong>+30 eco-points</strong> to the reporting citizen ({selectedDump.reporter?.name || 'Citizen'}).
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDump(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={clearing || !photoAfter}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  {clearing ? 'Clearing...' : 'Confirm Cleaned & Award +30 Pts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDumpsPage;
