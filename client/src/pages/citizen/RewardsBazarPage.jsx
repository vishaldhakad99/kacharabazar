import React, { useState, useEffect } from 'react';
import {
  Gift,
  Coins,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Zap,
  ShoppingBag,
  Ticket,
  Clock,
  X,
} from 'lucide-react';
import api from '../../api/client';
import useAuthStore from '../../store/useAuthStore';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export const RewardsBazarPage = () => {
  const { user, updateUser } = useAuthStore();
  const [rewards, setRewards] = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'my-coupons'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [couponModal, setCouponModal] = useState(null);

  const fetchData = async () => {
    try {
      const [rewRes, redRes] = await Promise.all([
        api.get('/rewards'),
        api.get('/rewards/my-redemptions'),
      ]);
      if (rewRes.success) setRewards(rewRes.rewards || []);
      if (redRes.success) setMyRedemptions(redRes.redemptions || []);
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRedeem = async (reward) => {
    if ((user?.ecoBalance || 0) < reward.pointsCost) {
      toast.error(
        `Insufficient points! You need ${reward.pointsCost} pts, but have ${user?.ecoBalance || 0} pts.`
      );
      return;
    }

    if (!window.confirm(`Redeem "${reward.title}" for ${reward.pointsCost} eco-points?`)) {
      return;
    }

    setRedeemingId(reward._id);
    try {
      const res = await api.post(`/rewards/${reward._id}/redeem`);
      if (res.success && res.redemption) {
        toast.success('Reward redeemed successfully!');
        updateUser({ ecoBalance: res.remainingBalance });
        setCouponModal(res.redemption);
        fetchData();
      }
    } catch (err) {
      // Interceptor handles error
    } finally {
      setRedeemingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Coupon code copied to clipboard!');
  };

  const filteredRewards = rewards.filter((r) => {
    if (categoryFilter === 'all') return true;
    return r.category === categoryFilter;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
            Green Marketplace
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
            <Gift className="w-7 h-7 text-accent-500" />
            Rewards Bazar
          </h1>
          <p className="text-xs text-muted">
            Redeem your verified eco-points for real municipal utility subsidies and sustainable household kits.
          </p>
        </div>

        {/* Current Balance pill */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-accent-50 dark:bg-accent-950/60 border border-accent-200 dark:border-accent-900">
          <Coins className="w-5 h-5 text-accent-500" />
          <div>
            <span className="text-[10px] text-muted block leading-none">Your Spendable Balance</span>
            <span className="text-base font-extrabold text-accent-600 dark:text-accent-400 font-heading">
              {user?.ecoBalance || 0} pts
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'catalog'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-muted hover:text-ink dark:hover:text-white'
          }`}
        >
          Rewards Catalog ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab('my-coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my-coupons'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-muted hover:text-ink dark:hover:text-white'
          }`}
        >
          My Redeemed Coupons ({myRedemptions.length})
        </button>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'utilities', label: 'Electricity & Water Subsidies' },
              { id: 'goods', label: 'Segregation & Composting Kits' },
              { id: 'vouchers', label: 'Local Store Coupons' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  categoryFilter === cat.id
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-muted hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredRewards.map((reward) => {
                const canAfford = (user?.ecoBalance || 0) >= reward.pointsCost;
                const isOutOfStock = reward.stock <= 0;

                return (
                  <div
                    key={reward._id}
                    className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Image header */}
                      <div className="h-36 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {reward.image ? (
                          <img
                            src={reward.image}
                            alt={reward.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary-600">
                            <Gift className="w-10 h-10" />
                          </div>
                        )}
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 dark:bg-gray-900/95 text-ink dark:text-white shadow">
                          {reward.category}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-heading font-bold text-sm text-ink dark:text-white line-clamp-2 leading-snug">
                          {reward.title}
                        </h3>
                        <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                          {reward.description}
                        </p>
                        <p className="text-[10px] text-primary-700 dark:text-primary-300 font-semibold truncate">
                          Partner: {reward.partnerName}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 pt-0 border-t border-gray-50 dark:border-gray-800/60 mt-2">
                      <div className="flex items-center justify-between mb-3 pt-3">
                        <div className="flex items-center gap-1 font-heading font-extrabold text-sm text-accent-600 dark:text-accent-400">
                          <Coins className="w-4 h-4" />
                          <span>{reward.pointsCost} pts</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold ${
                            isOutOfStock ? 'text-red-500' : 'text-muted'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : `${reward.stock} available`}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford || isOutOfStock || redeemingId === reward._id}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 ${
                          !canAfford
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            : isOutOfStock
                            ? 'bg-gray-100 dark:bg-gray-800 text-red-400 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-md'
                        }`}
                      >
                        {redeemingId === reward._id
                          ? 'Redeeming...'
                          : isOutOfStock
                          ? 'Out of Stock'
                          : canAfford
                          ? 'Redeem Coupon'
                          : `Need ${reward.pointsCost - (user?.ecoBalance || 0)} more pts`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Redeemed Coupons */}
      {activeTab === 'my-coupons' && (
        <div className="space-y-4">
          {myRedemptions.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              You haven't redeemed any rewards yet. Select an item from the catalog above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRedemptions.map((red) => (
                <div
                  key={red._id}
                  className="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400">
                        {red.reward?.category || 'Voucher'}
                      </span>
                      <h4 className="font-heading font-bold text-sm text-ink dark:text-white">
                        {red.reward?.title || 'Green Reward Coupon'}
                      </h4>
                      <p className="text-[11px] text-muted mt-0.5">
                        Issued on {new Date(red.createdAt).toLocaleDateString()} • {red.pointsSpent} pts
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        red.status === 'fulfilled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {red.status}
                    </span>
                  </div>

                  {/* Coupon Code Box */}
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-muted block">
                        Your Unique Voucher Code
                      </span>
                      <span className="font-mono font-black text-sm tracking-wider text-primary-700 dark:text-primary-300">
                        {red.code}
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(red.code)}
                      className="p-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-100 text-primary-600 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Redemption Success Modal */}
      {couponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shadow-md animate-bounce">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Redemption Successful!
              </span>
              <h2 className="text-xl font-heading font-black text-ink dark:text-white mt-1">
                {couponModal.reward?.title || 'Reward Issued'}
              </h2>
              <p className="text-xs text-muted mt-1">
                Points have been deducted. Present the coupon code below at the partner office or utility portal.
              </p>
            </div>

            {/* Generated Code Display */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-primary-500 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted">
                Your Redemption Voucher Code
              </span>
              <div className="font-mono font-black text-xl text-primary-700 dark:text-primary-300 tracking-wider">
                {couponModal.code}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(couponModal.code)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4" /> Copy Code
              </button>
              <button
                onClick={() => setCouponModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsBazarPage;
