import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import {
  Gift,
  Plus,
  CheckCircle2,
  XCircle,
  Tag,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Sparkles,
} from 'lucide-react';
import CsvExportButton from '../../components/common/CsvExportButton';

const AdminRewardsPage = () => {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'redemptions'
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states for creating new reward
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    category: 'vouchers',
    pointsCost: 100,
    stock: 50,
    partnerName: 'Bhopal Municipal Green Initiative',
    terms: 'Valid for 90 days from redemption. Non-transferable.',
  });

  const fetchCatalog = async () => {
    try {
      const res = await api.get('/rewards');
      setRewards(res.data.rewards || []);
    } catch (err) {
      toast.error('Failed to load rewards catalog.');
    }
  };

  const fetchRedemptions = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/rewards/redemptions', { params });
      setRedemptions(res.data.redemptions || []);
    } catch (err) {
      toast.error('Failed to load citizen redemptions.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'catalog') {
      await fetchCatalog();
    } else {
      await fetchRedemptions();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter]);

  const handleCreateReward = async (e) => {
    e.preventDefault();
    if (!newReward.title || !newReward.description || !newReward.pointsCost) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/rewards', newReward);
      toast.success('New reward added to catalog!');
      setIsModalOpen(false);
      setNewReward({
        title: '',
        description: '',
        category: 'vouchers',
        pointsCost: 100,
        stock: 50,
        partnerName: 'Bhopal Municipal Green Initiative',
        terms: 'Valid for 90 days from redemption. Non-transferable.',
      });
      fetchCatalog();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create reward item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRewardActive = async (reward) => {
    try {
      await api.patch(`/rewards/${reward._id}`, {
        isActive: !reward.isActive,
      });
      toast.success(`Reward marked as ${!reward.isActive ? 'Active' : 'Disabled'}`);
      fetchCatalog();
    } catch (err) {
      toast.error('Failed to update reward status.');
    }
  };

  const handleFulfillRedemption = async (id) => {
    try {
      await api.patch(`/rewards/redemptions/${id}`, { status: 'fulfilled' });
      toast.success('Redemption marked as fulfilled!');
      fetchRedemptions();
    } catch (err) {
      toast.error('Failed to fulfill redemption.');
    }
  };

  const filteredCatalog = rewards.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRedemptions = redemptions.filter((red) =>
    red.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    red.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    red.reward?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="w-7 h-7 text-emerald-600" />
            <h1 className="text-2xl font-bold text-stone-900 font-heading">
              Rewards & Bazar Management
            </h1>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Manage redemption items, reward voucher stock, and fulfill citizen reward claims.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'catalog' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Reward Item
            </button>
          ) : (
            <CsvExportButton
              data={filteredRedemptions.map((r) => ({
                RedemptionID: r._id,
                CitizenName: r.user?.name || 'N/A',
                CitizenPhone: r.user?.phone || 'N/A',
                Reward: r.reward?.title || 'N/A',
                PointsSpent: r.pointsSpent,
                CouponCode: r.code,
                Status: r.status,
                IssuedAt: r.createdAt ? new Date(r.createdAt).toLocaleString() : '',
              }))}
              filename="kachra_bazar_redemptions.csv"
              label="Export CSV"
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 bg-white rounded-t-2xl px-6 pt-3">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Gift className="w-4 h-4" />
          Catalog Items ({rewards.length})
        </button>
        <button
          onClick={() => setActiveTab('redemptions')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'redemptions'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Tag className="w-4 h-4" />
          Citizen Redemptions ({redemptions.length})
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'catalog' ? 'Search rewards...' : 'Search by coupon or citizen...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {activeTab === 'redemptions' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="issued">Issued / Unclaimed</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Catalog Grid */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalog.map((reward) => (
            <div
              key={reward._id}
              className={`bg-white rounded-2xl border p-5 transition-shadow hover:shadow-md flex flex-col justify-between ${
                reward.isActive ? 'border-stone-200' : 'border-stone-200 bg-stone-50 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {reward.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    reward.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {reward.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-stone-900 mb-1">{reward.title}</h3>
                <p className="text-sm text-stone-600 line-clamp-2 mb-4">{reward.description}</p>

                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-1.5 text-xs text-stone-600 mb-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-stone-500">Points Cost:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {reward.pointsCost} pts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-stone-500">Remaining Stock:</span>
                    <span className="font-semibold text-stone-800">{reward.stock} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-stone-500">Partner:</span>
                    <span className="text-stone-800 truncate max-w-[150px]">{reward.partnerName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  onClick={() => handleToggleRewardActive(reward)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                    reward.isActive
                      ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                      : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {reward.isActive ? 'Disable Reward' : 'Activate Reward'}
                </button>
                <span className="text-xs text-stone-400">ID: {reward._id.substring(reward._id.length - 6)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Redemptions Table */}
      {activeTab === 'redemptions' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 text-xs uppercase font-semibold text-stone-700">
                <tr>
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Citizen</th>
                  <th className="py-3.5 px-4">Reward</th>
                  <th className="py-3.5 px-4">Points</th>
                  <th className="py-3.5 px-4">Date Issued</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRedemptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-stone-500">
                      No citizen redemptions found.
                    </td>
                  </tr>
                ) : (
                  filteredRedemptions.map((red) => (
                    <tr key={red._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-xs">
                        {red.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-stone-900">{red.user?.name || 'Anonymous Citizen'}</div>
                        <div className="text-xs text-stone-400">{red.user?.phone || red.user?.email}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-800">
                        {red.reward?.title || 'Unknown Reward'}
                      </td>
                      <td className="py-3 px-4 text-emerald-600 font-semibold">
                        -{red.pointsSpent} pts
                      </td>
                      <td className="py-3 px-4 text-xs text-stone-500">
                        {new Date(red.createdAt).toLocaleDateString()} {new Date(red.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            red.status === 'fulfilled'
                              ? 'bg-green-100 text-green-700'
                              : red.status === 'issued'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {red.status === 'fulfilled' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {red.status.charAt(0).toUpperCase() + red.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {red.status === 'issued' && (
                          <button
                            onClick={() => handleFulfillRedemption(red._id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            Mark Fulfilled
                          </button>
                        )}
                        {red.status === 'fulfilled' && (
                          <span className="text-xs text-stone-400 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Reward Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">Add New Reward Item</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Reward Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹100 Electricity Bill Rebate (MPEB)"
                  value={newReward.title}
                  onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="Explain how the discount or item works..."
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newReward.category}
                    onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="vouchers">Utility Voucher</option>
                    <option value="kits">Segregation Kit</option>
                    <option value="merchandise">Green Merch / Bags</option>
                    <option value="coupons">Merchant Coupon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Eco-Points Cost *
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={newReward.pointsCost}
                    onChange={(e) => setNewReward({ ...newReward, pointsCost: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Initial Stock (Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newReward.stock}
                    onChange={(e) => setNewReward({ ...newReward, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Partner / Sponsor
                  </label>
                  <input
                    type="text"
                    value={newReward.partnerName}
                    onChange={(e) => setNewReward({ ...newReward, partnerName: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Terms & Conditions
                </label>
                <input
                  type="text"
                  value={newReward.terms}
                  onChange={(e) => setNewReward({ ...newReward, terms: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 rounded-lg text-sm hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRewardsPage;
