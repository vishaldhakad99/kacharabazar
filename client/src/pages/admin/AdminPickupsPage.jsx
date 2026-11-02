import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  UserCheck,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  ExternalLink,
} from 'lucide-react';
import api from '../../api/client';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import CsvExportButton from '../../components/common/CsvExportButton';
import toast from 'react-hot-toast';

export const AdminPickupsPage = () => {
  const [pickups, setPickups] = useState([]);
  const [wards, setWards] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Assign modal state
  const [assignPickupModal, setAssignPickupModal] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(wardFilter && { ward: wardFilter }),
      });

      const res = await api.get(`/pickups?${queryParams.toString()}`);
      if (res.success) {
        setPickups(res.pickups || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [wRes, uRes, vRes] = await Promise.all([
        api.get('/wards'),
        api.get('/users?role=worker&limit=50'),
        api.get('/vehicles?limit=50'),
      ]);
      if (wRes.success) setWards(wRes.wards || []);
      if (uRes.success) {
        setWorkers(uRes.users || []);
        if (uRes.users?.length > 0) setSelectedWorker(uRes.users[0]._id);
      }
      if (vRes.success) {
        setVehicles(vRes.vehicles || []);
        if (vRes.vehicles?.length > 0) setSelectedVehicle(vRes.vehicles[0]._id);
      }
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchAuxData();
  }, []);

  useEffect(() => {
    fetchPickups();
  }, [page, statusFilter, wardFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPickups();
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorker || !selectedVehicle) {
      toast.error('Please select both worker and vehicle.');
      return;
    }

    setAssigning(true);
    try {
      const res = await api.patch(`/pickups/${assignPickupModal._id}/assign`, {
        workerId: selectedWorker,
        vehicleId: selectedVehicle,
      });

      if (res.success) {
        toast.success('Pickup request assigned successfully.');
        setAssignPickupModal(null);
        fetchPickups();
      }
    } catch (err) {
      // Handled
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
            Dispatch Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-primary-600" />
            Citizen Pickup Requests ({total})
          </h1>
          <p className="text-xs text-muted">
            Manage on-demand collection requests across all 8 Bhopal municipal wards.
          </p>
        </div>

        <CsvExportButton
          data={pickups.map((p) => ({
            ID: p._id,
            Citizen: p.citizen?.name,
            Phone: p.citizen?.phone,
            Ward: p.ward?.name,
            WasteType: p.wasteType,
            Address: p.address,
            Slot: p.slot,
            Status: p.status,
            Worker: p.assignedWorker?.name || 'Unassigned',
            Vehicle: p.assignedVehicle?.regNumber || 'Unassigned',
            Points: p.pointsAwarded,
            CreatedAt: p.createdAt,
          }))}
          filename="bhopal-pickups"
        />
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by address or locality..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="on_the_way">On The Way</option>
            <option value="collected">Collected</option>
            <option value="verified">Verified (+Pts)</option>
            <option value="missed">Missed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Ward filter */}
          <select
            value={wardFilter}
            onChange={(e) => {
              setWardFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none"
          >
            <option value="">All Wards</option>
            {wards.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name} ({w.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pickups Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : pickups.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">
            No pickup requests found matching these filters.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-muted uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">Request ID</th>
                <th className="pb-3 font-bold">Citizen</th>
                <th className="pb-3 font-bold">Ward</th>
                <th className="pb-3 font-bold">Type</th>
                <th className="pb-3 font-bold">Slot</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Assignment</th>
                <th className="pb-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {pickups.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="py-3 font-mono font-bold text-ink dark:text-white">
                    #{p._id.substring(p._id.length - 6).toUpperCase()}
                  </td>

                  <td className="py-3">
                    <span className="font-bold text-ink dark:text-white block">
                      {p.citizen?.name}
                    </span>
                    <span className="text-[11px] text-muted">{p.citizen?.phone}</span>
                  </td>

                  <td className="py-3 text-muted">{p.ward?.name || 'Bhopal'}</td>

                  <td className="py-3 capitalize font-semibold">{p.wasteType}</td>

                  <td className="py-3 text-muted">{p.slot}</td>

                  <td className="py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'collected'
                          ? 'bg-sky-100 text-sky-800'
                          : p.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 text-muted">
                    {p.assignedWorker ? (
                      <div>
                        <span className="font-semibold text-ink dark:text-white block">
                          {p.assignedWorker.name}
                        </span>
                        <span className="text-[10px] text-primary-600">
                          {p.assignedVehicle?.regNumber}
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-600 font-semibold text-[11px]">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3 text-right">
                    {p.status === 'pending' ? (
                      <button
                        onClick={() => setAssignPickupModal(p)}
                        className="px-3 py-1 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm"
                      >
                        Assign
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted font-medium">Dispatched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-muted">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {assignPickupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary-600">
                  Dispatcher Assignment
                </span>
                <h3 className="font-heading font-black text-lg text-ink dark:text-white">
                  Allocate Worker & Truck
                </h3>
              </div>
              <button
                onClick={() => setAssignPickupModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-muted mb-1">
                  Select Sanitation Worker
                </label>
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                >
                  {workers.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.ward?.name || 'Worker'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-muted mb-1">
                  Select Collection Vehicle
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                >
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.regNumber} ({v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignPickupModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-md"
                >
                  {assigning ? 'Assigning...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPickupsPage;
