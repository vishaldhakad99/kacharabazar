import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, CalendarPlus, ChevronRight, Clock, MapPin, ArrowRight } from 'lucide-react';
import api from '../../api/client';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

export const CitizenPickupsPage = () => {
  const [pickups, setPickups] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pickups${statusFilter ? `?status=${statusFilter}` : ''}`);
      if (res.success) {
        setPickups(res.pickups || []);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
            History & Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-primary-600" />
            My Pickup Requests
          </h1>
          <p className="text-xs text-muted">
            Track live status, worker assignments, verification results, and ratings.
          </p>
        </div>

        <Link
          to="/dashboard/pickups/new"
          className="self-start sm:self-auto px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
        >
          <CalendarPlus className="w-4 h-4" /> Request New Pickup
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: '', label: 'All Requests' },
          { id: 'pending', label: 'Pending' },
          { id: 'assigned', label: 'Assigned' },
          { id: 'on_the_way', label: 'On The Way' },
          { id: 'collected', label: 'Collected' },
          { id: 'verified', label: 'Verified (+Pts)' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              statusFilter === tab.id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pickups List */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : pickups.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No pickup requests found"
          description="You haven't requested any pickups matching this filter."
          actionLabel="Schedule Pickup"
          actionLink="/dashboard/pickups/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pickups.map((p) => (
            <Link
              key={p._id}
              to={`/dashboard/pickups/${p._id}`}
              className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-muted font-bold">
                    #{p._id.substring(p._id.length - 6).toUpperCase()}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : p.status === 'collected'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : p.status === 'cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {p.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-sm text-ink dark:text-white capitalize flex items-center justify-between">
                  <span>{p.wasteType} Waste Collection</span>
                  {p.pointsAwarded > 0 && (
                    <span className="text-xs font-black text-accent-600">
                      +{p.pointsAwarded} pts
                    </span>
                  )}
                </h3>

                <p className="text-xs text-muted line-clamp-1 mt-1">{p.address}</p>
              </div>

              <div className="pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-primary-600" /> Slot: {p.slot}
                </span>

                <span className="text-primary-600 dark:text-primary-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Details <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitizenPickupsPage;
