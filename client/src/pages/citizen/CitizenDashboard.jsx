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
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            Citizen Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-stone-900 dark:text-white">
            Namaste, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-stone-500">
            Ward: <strong>{user?.ward?.name || 'Bhopal Ward'}</strong> • Segregate waste at home, earn real rewards!
          </p>
        </div>

        <Link
          to="/dashboard/pickups/new"
          className="self-start sm:self-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
        >
          <CalendarPlus className="w-4 h-4" /> Schedule Waste Pickup
        </Link>
      </div>

      {/* Announcements Bar */}
      {announcements.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <Megaphone className="w-4 h-4 text-amber-500 flex-shrink-0 animate-bounce" />
            <span className="font-semibold truncate">
              {announcements[0].title}: {announcements[0].body}
            </span>
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold whitespace-nowrap px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60">
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Quick Civic Actions
          </h3>

          <div className="grid grid-cols-2 gap-3 flex-1">
            <Link
              to="/dashboard/pickups/new"
              className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-stone-200/80 dark:border-gray-800 shadow-sm card-hover flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                <CalendarPlus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-white block">
                  Book Pickup
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Doorstep collection</span>
              </div>
            </Link>

            <Link
              to="/dashboard/track"
              className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-stone-200/80 dark:border-gray-800 shadow-sm card-hover flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-white block">
                  Track Truck
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Live GPS & ETA</span>
              </div>
            </Link>

            <Link
              to="/dashboard/dumps/new"
              className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-stone-200/80 dark:border-gray-800 shadow-sm card-hover flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-white block">
                  Report Hotspot
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Earn +30 bonus pts</span>
              </div>
            </Link>

            <Link
              to="/dashboard/rewards"
              className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-stone-200/80 dark:border-gray-800 shadow-sm card-hover flex flex-col justify-between group"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-white block">
                  Rewards Bazar
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">Bill rebates & kits</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Pickup Status Card */}
      {activePickup && (
        <div className="rounded-3xl p-6 bg-white dark:bg-gray-900 border border-stone-200/80 dark:border-gray-800 shadow-sm space-y-4 card-hover">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-gray-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                Active Doorstep Request
              </span>
              <h3 className="font-heading font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                Pickup #{activePickup._id.substring(activePickup._id.length - 6).toUpperCase()} •{' '}
                <span className="capitalize">{activePickup.wasteType} Waste</span>
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Slot: {activePickup.slot}
              </span>
              <Link
                to={`/dashboard/pickups/${activePickup._id}`}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 group"
              >
                Full Details <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <StatusTimeline
            status={activePickup.status}
            segregation={activePickup.segregation}
            points={activePickup.segregation === 'correct' ? 20 : activePickup.segregation === 'partial' ? 10 : 0}
          />
        </div>
      )}

      {/* Recent Pickups Table */}
      <div className="rounded-3xl p-6 bg-white dark:bg-gray-900 border border-stone-200/80 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-stone-900 dark:text-white">
              Recent Waste Pickups
            </h3>
            <p className="text-xs text-stone-500">History of your doorstep collection requests</p>
          </div>
          <Link
            to="/dashboard/pickups"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            View All ({recentPickups.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPickups.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone-400">
            No pickups scheduled yet. Click "Schedule Waste Pickup" above to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600 dark:text-gray-300">
              <thead className="bg-stone-50/80 dark:bg-gray-800/50 uppercase font-semibold text-[11px] text-stone-500 border-b border-stone-100 dark:border-gray-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Waste Type</th>
                  <th className="py-2.5 px-3">Slot</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Segregation</th>
                  <th className="py-2.5 px-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-gray-800">
                {recentPickups.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50/60 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-2.5 px-3 capitalize font-semibold text-stone-800 dark:text-white">
                      {p.wasteType}
                    </td>
                    <td className="py-2.5 px-3">{p.slot}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          p.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'collected'
                            ? 'bg-sky-100 text-sky-800'
                            : p.status === 'on_the_way'
                            ? 'bg-purple-100 text-purple-800'
                            : p.status === 'assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 capitalize">
                      {p.segregation || (
                        <span className="text-stone-400 italic">Pending check</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {p.segregation === 'correct' ? '+20' : p.segregation === 'partial' ? '+10' : '0'} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
