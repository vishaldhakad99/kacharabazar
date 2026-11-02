import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, ShieldCheck, Flame, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import api from '../../api/client';
import YourWorthCard from '../../components/common/YourWorthCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export const PointsHistoryPage = () => {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, histRes] = await Promise.all([
        api.get('/points/summary'),
        api.get(`/points/history?page=${page}&limit=15${typeFilter ? `&type=${typeFilter}` : ''}`),
      ]);

      if (sumRes.success) setSummary(sumRes.summary);
      if (histRes.success) {
        setHistory(histRes.history || []);
        setTotal(histRes.total || 0);
        setTotalPages(histRes.totalPages || 1);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, typeFilter]);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
          Citizen Environmental Accounting
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
          <Coins className="w-7 h-7 text-accent-500" />
          Eco-Points Ledger & Worth
        </h1>
        <p className="text-xs text-muted">
          Immutable ledger of every earned and redeemed eco-point. Points are credited exclusively
          upon physical worker verification.
        </p>
      </div>

      {/* Your Worth Card */}
      <YourWorthCard summary={summary} loading={loading && !summary} />

      {/* Official Eco-Points Rules Reference Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-sm text-ink dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary-600" />
          Official Eco-Points Crediting Rules (Bhopal Pilot)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
            <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 block font-heading">
              +20 pts
            </span>
            <span className="text-[10px] text-muted dark:text-gray-300 mt-0.5 block font-medium">
              100% Correct Segregation
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900">
            <span className="text-xs font-black text-sky-700 dark:text-sky-300 block font-heading">
              +10 pts
            </span>
            <span className="text-[10px] text-muted dark:text-gray-300 mt-0.5 block font-medium">
              Partial Segregation
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700">
            <span className="text-xs font-black text-gray-600 dark:text-gray-400 block font-heading">
              0 pts
            </span>
            <span className="text-[10px] text-muted dark:text-gray-400 mt-0.5 block font-medium">
              Unsegregated Mixed Waste
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 block font-heading">
              +30 pts
            </span>
            <span className="text-[10px] text-muted dark:text-gray-300 mt-0.5 block font-medium">
              Cleared Dump Report
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900">
            <span className="text-xs font-black text-orange-600 dark:text-orange-400 block font-heading">
              +50 pts
            </span>
            <span className="text-[10px] text-muted dark:text-gray-300 mt-0.5 block font-medium">
              7-Day Streak Bonus
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
            <span className="text-xs font-black text-purple-600 dark:text-purple-400 block font-heading">
              +5 pts
            </span>
            <span className="text-[10px] text-muted dark:text-gray-300 mt-0.5 block font-medium">
              Service Rating Feedback
            </span>
          </div>
        </div>
      </div>

      {/* Ledger History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-base text-ink dark:text-white">
              Immutable Points Ledger
            </h3>
            <p className="text-xs text-muted">
              Total Transactions: <strong>{total}</strong>
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-medium">
            <button
              onClick={() => {
                setTypeFilter('');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors ${
                typeFilter === ''
                  ? 'bg-white dark:bg-gray-900 font-bold shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setTypeFilter('earn');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors ${
                typeFilter === 'earn'
                  ? 'bg-white dark:bg-gray-900 font-bold text-emerald-600 shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Earned (+)
            </button>
            <button
              onClick={() => {
                setTypeFilter('redeem');
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors ${
                typeFilter === 'redeem'
                  ? 'bg-white dark:bg-gray-900 font-bold text-accent-600 shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Redeemed (-)
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton count={4} />
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted">
            No transactions found for the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {history.map((tx) => (
              <div
                key={tx._id}
                className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold ${
                      tx.type === 'earn'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300'
                    }`}
                  >
                    {tx.type === 'earn' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-ink dark:text-white block">{tx.reason}</span>
                    <span className="text-[11px] text-muted">
                      {new Date(tx.createdAt).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-heading font-black text-sm block ${
                      tx.type === 'earn'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-accent-600 dark:text-accent-400'
                    }`}
                  >
                    {tx.type === 'earn' ? `+${tx.amount}` : `-${tx.amount}`} pts
                  </span>
                  <span className="text-[10px] text-muted block">
                    Balance After: {tx.balanceAfter} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <span className="text-muted">
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
    </div>
  );
};

export default PointsHistoryPage;
