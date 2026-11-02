import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  UserCheck,
  MapPin,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import api from '../../api/client';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import CsvExportButton from '../../components/common/CsvExportButton';
import toast from 'react-hot-toast';

export const AdminDumpsPage = () => {
  const [dumps, setDumps] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [wards, setWards] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Assignment state
  const [assignModal, setAssignModal] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Photo viewer modal
  const [photoModal, setPhotoModal] = useState(null);

  const fetchDumps = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        limit: 50,
        ...(statusFilter && { status: statusFilter }),
        ...(severityFilter && { severity: severityFilter }),
        ...(wardFilter && { ward: wardFilter }),
      });

      const res = await api.get(`/dumps?${queryParams.toString()}`);
      if (res.success) {
        setDumps(res.dumps || []);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkersAndWards = async () => {
    try {
      const [uRes, wRes] = await Promise.all([
        api.get('/users?role=worker&limit=50'),
        api.get('/wards'),
      ]);
      if (uRes.success) {
        setWorkers(uRes.users || []);
        if (uRes.users?.length > 0) setSelectedWorker(uRes.users[0]._id);
      }
      if (wRes.success) setWards(wRes.wards || []);
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchWorkersAndWards();
  }, []);

  useEffect(() => {
    fetchDumps();
  }, [statusFilter, severityFilter, wardFilter]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedWorker) {
      toast.error('Please select a sanitation worker.');
      return;
    }

    setAssigning(true);
    try {
      const res = await api.patch(`/dumps/${assignModal._id}/assign`, {
        workerId: selectedWorker,
      });

      if (res.success) {
        toast.success('Worker assigned to clear garbage hotspot.');
        setAssignModal(null);
        fetchDumps();
      }
    } catch (err) {
      // Handled
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider">
            City Cleanliness Enforcement
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-accent-500" />
            Civic Dump Hotspots ({dumps.length})
          </h1>
          <p className="text-xs text-muted">
            Track reported roadside dumps, assign clearance crews, and verify before/after remediation.
          </p>
        </div>

        <CsvExportButton
          data={dumps.map((d) => ({
            ID: d._id,
            Reporter: d.reporter?.name,
            Ward: d.ward?.name,
            Address: d.address,
            Description: d.description,
            Severity: d.severity,
            Status: d.status,
            Worker: d.assignedWorker?.name || 'Unassigned',
            ClearedAt: d.clearedAt || 'Pending',
          }))}
          filename="bhopal-dump-hotspots"
        />
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="open">Open (Unassigned)</option>
          <option value="assigned">Assigned to Crew</option>
          <option value="cleared">Cleared (Verified)</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none"
        >
          <option value="">All Severities</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="low">Low Severity</option>
        </select>

        <select
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none"
        >
          <option value="">All Wards</option>
          {wards.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dump Hotspot Cards Grid */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : dumps.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          No dump hotspot reports found matching these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dumps.map((dump) => (
            <div
              key={dump._id}
              className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Before / After Photo Comparison */}
                <div className="h-44 w-full relative bg-gray-100 dark:bg-gray-800">
                  <div className="grid grid-cols-2 h-full">
                    {dump.photoBefore ? (
                      <div className="relative h-full border-r border-white/20">
                        <img
                          src={dump.photoBefore}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white">
                          Before
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-xs text-muted">
                        No Photo
                      </div>
                    )}

                    {dump.photoAfter ? (
                      <div className="relative h-full">
                        <img
                          src={dump.photoAfter}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-700 text-white">
                          Cleared ✓
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-[10px] text-muted text-center p-2 bg-gray-50 dark:bg-gray-800">
                        Awaiting Remediation
                      </div>
                    )}
                  </div>

                  <span
                    className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow ${
                      dump.status === 'cleared'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {dump.status}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold capitalize text-[11px] ${
                        dump.severity === 'high'
                          ? 'text-red-600'
                          : dump.severity === 'medium'
                          ? 'text-amber-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {dump.severity} Severity
                    </span>
                    <span className="text-muted text-[10px]">Ward: {dump.ward?.name}</span>
                  </div>

                  <p className="font-semibold text-ink dark:text-white line-clamp-2">
                    {dump.description}
                  </p>

                  <p className="text-muted line-clamp-1 flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary-600" />
                    <span>{dump.address || 'Roadside Hotspot'}</span>
                  </p>

                  {dump.workerNotes && (
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-[11px] text-muted">
                      <strong>Remediation:</strong> {dump.workerNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 pt-0 border-t border-gray-50 dark:border-gray-800/60 mt-2">
                <div className="flex items-center justify-between pt-3">
                  <span className="text-[11px] text-muted">
                    {dump.assignedWorker ? (
                      <span>Worker: <strong>{dump.assignedWorker.name}</strong></span>
                    ) : (
                      <span className="text-amber-600 font-semibold">Unassigned</span>
                    )}
                  </span>

                  {dump.status !== 'cleared' && (
                    <button
                      onClick={() => setAssignModal(dump)}
                      className="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm"
                    >
                      Assign Crew
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary-600">
                  Assign Sanitation Worker
                </span>
                <h3 className="font-heading font-black text-lg text-ink dark:text-white">
                  Dispatch Dump Clearance Crew
                </h3>
              </div>
              <button
                onClick={() => setAssignModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-muted mb-1">
                  Select Field Worker
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

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-md"
                >
                  {assigning ? 'Dispatching...' : 'Assign Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDumpsPage;
