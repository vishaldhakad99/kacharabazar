import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarPlus,
  Truck,
  AlertTriangle,
  Gift,
  Coins,
  ArrowRight,
  Clock,
  CheckCircle2,
  Megaphone,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import api from '../../api/client';
import YourWorthCard from '../../components/common/YourWorthCard';
import StatusTimeline from '../../components/common/StatusTimeline';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const CitizenDashboard = () => {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [activePickup, setActivePickup] = useState(null);
  const [recentPickups, setRecentPickups] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, pickRes, annRes] = await Promise.all([
          api.get('/points/summary'),
          api.get('/pickups?limit=5'),
          api.get('/announcements?limit=3'),
        ]);

        if (sumRes.success) setSummary(sumRes.summary);
        if (pickRes.success) {
          setRecentPickups(pickRes.pickups || []);
          // Active pickup is any non-cancelled and non-verified request
          const active = pickRes.pickups?.find((p) =>
            ['pending', 'assigned', 'on_the_way', 'collected'].includes(p.status)
          );
          setActivePickup(active || pickRes.pickups?.[0] || null);
        }
        if (annRes.success) setAnnouncements(annRes.announcements || []);
      } catch (err) {
        // Ignore
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
            Citizen Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white">
            Namaste, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-muted">
            Ward: <strong>{user?.ward?.name || 'Bhopal Ward'}</strong> • Segregate waste at home, earn real rewards!
          </p>
        </div>

        <Link
          to="/dashboard/pickups/new"
          className="self-start sm:self-auto px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
        >
          <CalendarPlus className="w-4 h-4" /> Schedule Waste Pickup
        </Link>
      </div>

      {/* Announcements Bar */}
      {announcements.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <Megaphone className="w-4 h-4 text-accent-500 flex-shrink-0 animate-bounce" />
            <span className="font-semibold truncate">
              {announcements[0].title}: {announcements[0].body}
            </span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold whitespace-nowrap">
            Civic Notice
          </span>
        </div>
      )}

      {/* Grid: Your Worth Card + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <YourWorthCard summary={summary} loading={loading} />
        </div>

        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
            Quick Civic Actions
          </h3>

          <div className="grid grid-cols-2 gap-3 flex-1">
            <Link
              to="/dashboard/pickups/new"
              className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <CalendarPlus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-ink dark:text-white block">
                  Book Pickup
                </span>
                <span className="text-[11px] text-muted">Doorstep collection</span>
              </div>
            </Link>

            <Link
              to="/dashboard/track"
              className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-ink dark:text-white block">
                  Track Truck
                </span>
                <span className="text-[11px] text-muted">Live GPS & ETA</span>
              </div>
            </Link>

            <Link
              to="/dashboard/dumps/new"
              className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-accent-500 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-accent-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-ink dark:text-white block">
                  Report Hotspot
                </span>
                <span className="text-[11px] text-muted">Earn +30 bonus pts</span>
              </div>
            </Link>

            <Link
              to="/dashboard/rewards"
              className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary-500 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-ink dark:text-white block">
                  Rewards Bazar
                </span>
                <span className="text-[11px] text-muted">Bill rebates & kits</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Pickup Status Card */}
      {activePickup && (
        <div className="rounded-3xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400">
                Active Doorstep Request
              </span>
              <h3 className="font-heading font-bold text-base text-ink dark:text-white flex items-center gap-2">
                Pickup #{activePickup._id.substring(activePickup._id.length - 6).toUpperCase()} •{' '}
                <span className="capitalize">{activePickup.wasteType} Waste</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Slot: {activePickup.slot}
              </span>
              <Link
                to={`/dashboard/pickups/${activePickup._id}`}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                Full Details <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <StatusTimeline
            status={activePickup.status}
            segregation={activePickup.segregation}
            points={activePickup.pointsAwarded}
          />
        </div>
      )}

      {/* Recent Pickups List */}
      <div className="rounded-3xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-ink dark:text-white">
            Recent Pickups History
          </h3>
          <Link
            to="/dashboard/pickups"
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            View All Pickups <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : recentPickups.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted">
            You haven't requested any pickups yet.{' '}
            <Link to="/dashboard/pickups/new" className="text-primary-600 font-bold underline">
              Schedule your first pickup
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentPickups.map((pickup) => (
              <div
                key={pickup._id}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-primary-700 dark:text-primary-300">
                    {pickup.wasteType[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-ink dark:text-white capitalize block">
                      {pickup.wasteType} Waste Collection
                    </span>
                    <span className="text-[11px] text-muted">
                      {new Date(pickup.createdAt).toLocaleDateString([], {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      • Slot: {pickup.slot}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      pickup.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : pickup.status === 'collected'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : pickup.status === 'cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {pickup.status.replace('_', ' ')}
                  </span>

                  {pickup.pointsAwarded > 0 && (
                    <span className="font-bold text-accent-600 dark:text-accent-400">
                      +{pickup.pointsAwarded} pts
                    </span>
                  )}

                  <Link
                    to={`/dashboard/pickups/${pickup._id}`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-ink dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
