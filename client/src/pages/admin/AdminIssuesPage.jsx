import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import {
  AlertOctagon,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Truck,
  User,
  MapPin,
  Wrench,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import CsvExportButton from '../../components/common/CsvExportButton';

const AdminIssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolution modal
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [newStatus, setNewStatus] = useState('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const res = await api.get('/issues', { params });
      setIssues(res.data.issues || []);
    } catch (err) {
      toast.error('Failed to load field issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [statusFilter, typeFilter]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    try {
      setUpdating(true);
      await api.patch(`/issues/${selectedIssue._id}`, {
        status: newStatus,
        resolutionNotes,
      });

      toast.success(`Issue updated to ${newStatus}!`);
      setSelectedIssue(null);
      setResolutionNotes('');
      fetchIssues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update issue.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Wrench className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case 'dismissed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600">
            <XCircle className="w-3.5 h-3.5" />
            Dismissed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <AlertOctagon className="w-3.5 h-3.5" />
            Open Alert
          </span>
        );
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'blocked_access':
        return '🚧 Blocked Street / Access';
      case 'bin_overflow':
        return '🗑️ Overflowing Community Bin';
      case 'vehicle_breakdown':
        return '🚚 Vehicle Breakdown / Flat Tyre';
      case 'resident_dispute':
        return '⚠️ Resident Non-Compliance';
      default:
        return '📌 General Operational Issue';
    }
  };

  const filteredIssues = issues.filter((iss) => {
    const text = `${iss.description} ${iss.worker?.name} ${iss.ward?.name} ${iss.vehicle?.regNumber}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-7 h-7 text-amber-600" />
            <h1 className="text-2xl font-bold text-stone-900 font-heading">
              Field Issues & Obstructions
            </h1>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Real-time incident reports raised by sanitation workers during door-to-door collection routes.
          </p>
        </div>

        <CsvExportButton
          data={filteredIssues.map((i) => ({
            IssueID: i._id,
            Type: i.type,
            Status: i.status,
            Worker: i.worker?.name || 'N/A',
            Ward: i.ward?.name || 'N/A',
            Vehicle: i.vehicle?.regNumber || 'N/A',
            Description: i.description,
            Resolution: i.resolutionNotes || '',
            ReportedAt: new Date(i.createdAt).toLocaleString(),
          }))}
          filename="kachra_bazar_field_issues.csv"
          label="Export Issues CSV"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by worker, ward, vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Issue Types</option>
            <option value="blocked_access">Blocked Access</option>
            <option value="bin_overflow">Bin Overflow</option>
            <option value="vehicle_breakdown">Vehicle Breakdown</option>
            <option value="resident_dispute">Resident Non-Compliance</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs uppercase font-semibold text-stone-700">
              <tr>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Reported By</th>
                <th className="py-3.5 px-4">Ward / Vehicle</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-stone-500">
                    No field issues matching filters.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-stone-800 text-xs">
                      {getTypeLabel(issue.type)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(issue.status)}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-stone-900 font-medium truncate">{issue.description}</p>
                      {issue.resolutionNotes && (
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Resolution: {issue.resolutionNotes}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {issue.worker?.name || 'Worker'}
                      </div>
                      <div className="text-xs text-stone-400">{issue.worker?.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="text-stone-800 font-medium">{issue.ward?.name || 'Bhopal Central'}</div>
                      {issue.vehicle && (
                        <div className="text-stone-500 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-stone-400" />
                          {issue.vehicle.regNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-stone-400">
                      {new Date(issue.createdAt).toLocaleDateString()} {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedIssue(issue);
                          setNewStatus(issue.status === 'open' ? 'in_progress' : issue.status);
                          setResolutionNotes(issue.resolutionNotes || '');
                        }}
                        className="px-3 py-1 bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 text-xs font-semibold rounded-lg border border-stone-200 transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-lg text-stone-900">Manage Field Issue</h3>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1">
              <div><strong className="text-stone-700">Type:</strong> {getTypeLabel(selectedIssue.type)}</div>
              <div><strong className="text-stone-700">Worker:</strong> {selectedIssue.worker?.name} ({selectedIssue.worker?.phone})</div>
              <div><strong className="text-stone-700">Description:</strong> {selectedIssue.description}</div>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Update Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress (Dispatching Support)</option>
                  <option value="resolved">Resolved (Issue Cleared)</option>
                  <option value="dismissed">Dismissed (No Action Required)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Resolution Notes / Action Taken
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Dispatched recovery mechanic; route resumed at 11:30 AM."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg text-sm hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Update Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIssuesPage;
