import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit3, X, Users } from 'lucide-react';
import api from '../../api/client';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export const AdminWardsPage = () => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add ward modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    population: 25000,
    coordinates: [77.4126, 23.2599],
  });
  const [saving, setSaving] = useState(false);

  const fetchWards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wards');
      if (res.success) setWards(res.wards || []);
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error('Ward name and code are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/wards', {
        name: formData.name,
        code: formData.code,
        population: formData.population,
        center: {
          coordinates: formData.coordinates,
        },
      });

      if (res.success) {
        toast.success('Ward added successfully.');
        setModalOpen(false);
        fetchWards();
      }
    } catch (err) {
      // Handled
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ward?')) return;
    try {
      const res = await api.delete(`/wards/${id}`);
      if (res.success) {
        toast.success('Ward removed.');
        fetchWards();
      }
    } catch (err) {
      // Handled
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
            City Demographics
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
            <MapPin className="w-7 h-7 text-primary-600" />
            Bhopal Municipal Wards ({wards.length})
          </h1>
          <p className="text-xs text-muted">
            Municipal sectors, population distribution, and centroid coordinates.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Ward
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {wards.map((w) => (
            <div
              key={w._id}
              className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between gap-3"
            >
              <div>
                <span className="font-mono text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-md">
                  {w.code}
                </span>
                <h3 className="font-heading font-black text-base text-ink dark:text-white mt-2">
                  {w.name}
                </h3>
                <p className="text-xs text-muted mt-1">{w.description || 'Bhopal Municipal Ward'}</p>
              </div>

              <div className="pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-accent-500" />
                  {w.population?.toLocaleString()} Pop.
                </span>
                <button
                  onClick={() => handleDelete(w._id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Ward Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-heading font-black text-lg text-ink dark:text-white">
                Create Bhopal Ward
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-muted mb-1">Ward Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Shahpura & Chunabhatti"
                  required
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-muted mb-1">Ward Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. BPL-W09"
                  required
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white uppercase"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-muted mb-1">Population</label>
                <input
                  type="number"
                  value={formData.population}
                  onChange={(e) => setFormData({ ...formData, population: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-md"
                >
                  {saving ? 'Saving...' : 'Add Ward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWardsPage;
