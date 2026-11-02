import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import api from '../../api/client';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export const WorkerReportIssuePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [type, setType] = useState('blocked_access');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please describe the issue in detail.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/issues', {
        type,
        description,
        wardId: user?.ward?._id || user?.ward,
      });

      if (res.success) {
        toast.success('Field issue report dispatched to Municipal Admin.');
        navigate('/worker');
      }
    } catch (err) {
      // Handled
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
          Field Incident Report
        </span>
        <h1 className="text-2xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-red-600" />
          Report Route Issue / Obstruction
        </h1>
        <p className="text-xs text-muted">
          Notify municipal engineers and supervisors immediately of road repair, blocked gates,
          bin overflows, or vehicle mechanical faults.
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
              Issue Category *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="blocked_access">Blocked Access / Road Digging</option>
              <option value="overflowing_bin">Overflowing Secondary Community Bin</option>
              <option value="vehicle_breakdown">Vehicle Mechanical Trouble / Hydraulic Fault</option>
              <option value="citizen_dispute">Citizen Uncooperative / Dispute</option>
              <option value="road_construction">Major Road Construction Diversion</option>
              <option value="other">Other Operational Obstacle</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
              Description & Location Specifics *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Pipeline repair digging on Sector 3 entrance prevents truck turning. 12 houses unreachable."
              rows={4}
              required
              className="w-full p-3 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting...' : 'Dispatch Incident Alert to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerReportIssuePage;
