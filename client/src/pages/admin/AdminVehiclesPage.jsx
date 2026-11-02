import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, Edit3, X, Gauge, MapPin } from 'lucide-react';
import api from '../../api/client';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import CsvExportButton from '../../components/common/CsvExportButton';
import toast from 'react-hot-toast';

export const AdminVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add vehicle modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    regNumber: '',
    type: 'tipper_truck',
    ward: '',
    capacityKg: 1500,
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, wRes] = await Promise.all([api.get('/vehicles'), api.get('/wards')]);
      if (vRes.success) setVehicles(vRes.vehicles || []);
      if (wRes.success) {
        setWards(wRes.wards || []);
        if (wRes.wards?.length > 0) {
          setFormData((prev) => ({ ...prev, ward: wRes.wards[0]._id }));
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.regNumber) {
      toast.error('Registration number is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/vehicles', formData);
      if (res.success) {
        toast.success('Vehicle registered successfully.');
        setModalOpen(false);
        setFormData({
          regNumber: '',
          type: 'tipper_truck',
          ward: wards[0]?._id || '',
          capacityKg: 1500,
        });
        fetchData();
      }
    } catch (err) {
      // Handled
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      const res = await api.delete(`/vehicles/${id}`);
      if (res.success) {
        toast.success('Vehicle deleted.');
        fetchData();
      }
    } catch (err) {
      // Handled
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
            Municipal Assets
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
            <Truck className="w-7 h-7 text-primary-600" />
            Collection Vehicle Fleet ({vehicles.length})
          </h1>
          <p className="text-xs text-muted">
            Manage BMC tippers, compactors, electric carts, and maintenance status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CsvExportButton
            data={vehicles.map((v) => ({
              RegNumber: v.regNumber,
              Type: v.type,
              Ward: v.ward?.name,
              CapacityKg: v.capacityKg,
              Status: v.status,
            }))}
            filename="bhopal-vehicles"
          />
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div
              key={v._id}
              className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-muted">
                    {v.ward?.name || 'Bhopal Central'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      v.status === 'on_route'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {v.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-heading font-black text-lg text-ink dark:text-white">
                  {v.regNumber}
                </h3>
                <p className="text-xs text-muted capitalize mt-0.5">
                  Type: {v.type.replace('_', ' ')}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-muted">
                <span>Payload: <strong>{v.capacityKg} kg</strong></span>
                <button
                  onClick={() => handleDelete(v._id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-heading font-black text-lg text-ink dark:text-white">
                Register Municipal Vehicle
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-muted mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.regNumber}
                  onChange={(e) => setFormData({ ...formData, regNumber: e.target.value })}
                  placeholder="e.g. MP04-EA-4521"
                  required
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white uppercase"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-muted mb-1">
                  Vehicle Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                >
                  <option value="tipper_truck">Tipper Truck</option>
                  <option value="compactor">Refuse Compactor</option>
                  <option value="electric_cart">Electric Cart</option>
                  <option value="mini_truck">Mini Truck</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-muted mb-1">
                  Assigned Ward
                </label>
                <select
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                >
                  {wards.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-muted mb-1">
                  Payload Capacity (kg)
                </label>
                <input
                  type="number"
                  value={formData.capacityKg}
                  onChange={(e) => setFormData({ ...formData, capacityKg: e.target.value })}
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
                  {saving ? 'Saving...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehiclesPage;
