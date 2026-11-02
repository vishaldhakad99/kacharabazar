import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Trash2, ShieldCheck, HardHat, Home, X } from 'lucide-react';
import api from '../../api/client';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import CsvExportButton from '../../components/common/CsvExportButton';
import toast from 'react-hot-toast';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [wards, setWards] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Create Staff Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'Demo@1234',
    role: 'worker',
    ward: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(wardFilter && { ward: wardFilter }),
      });

      const res = await api.get(`/users?${queryParams.toString()}`);
      if (res.success) {
        setUsers(res.users || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const fetchWards = async () => {
    try {
      const res = await api.get('/wards');
      if (res.success && res.wards) {
        setWards(res.wards);
        if (res.wards.length > 0) {
          setFormData((prev) => ({ ...prev, ward: res.wards[0]._id }));
        }
      }
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchWards();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, wardFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/users', formData);
      if (res.success) {
        toast.success(`${formData.role} account created successfully.`);
        setModalOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: 'Demo@1234',
          role: 'worker',
          ward: wards[0]?._id || '',
        });
        fetchUsers();
      }
    } catch (err) {
      // Handled
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await api.delete(`/users/${id}`);
      if (res.success) {
        toast.success('User deleted.');
        fetchUsers();
      }
    } catch (err) {
      // Handled
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
            RBAC & User Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-primary-600" />
            Platform Users ({total})
          </h1>
          <p className="text-xs text-muted">
            Citizens, sanitation workers, and municipal administrative officers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CsvExportButton
            data={users.map((u) => ({
              ID: u._id,
              Name: u.name,
              Email: u.email,
              Phone: u.phone,
              Role: u.role,
              Ward: u.ward?.name || 'All',
              Balance: u.ecoBalance || 0,
            }))}
            filename="bhopal-users"
          />

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Staff Member
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="citizen">Citizens</option>
            <option value="worker">Sanitation Workers</option>
            <option value="admin">Administrators</option>
          </select>

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
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted">No users found.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-muted uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">User</th>
                <th className="pb-3 font-bold">Contact</th>
                <th className="pb-3 font-bold">Role</th>
                <th className="pb-3 font-bold">Ward</th>
                <th className="pb-3 font-bold">Eco Balance</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="py-3">
                    <span className="font-bold text-ink dark:text-white block">{u.name}</span>
                    <span className="text-[11px] text-muted">{u.email}</span>
                  </td>

                  <td className="py-3 text-muted">{u.phone}</td>

                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : u.role === 'worker'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {u.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                      {u.role === 'worker' && <HardHat className="w-3 h-3" />}
                      {u.role === 'citizen' && <Home className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 text-muted">{u.ward?.name || 'All Bhopal'}</td>

                  <td className="py-3 font-bold text-accent-600">
                    {u.role === 'citizen' ? `${u.ecoBalance || 0} pts` : '—'}
                  </td>

                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

      {/* Add Staff Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-heading font-black text-lg text-ink dark:text-white">
                Create Staff Account
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-muted mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rameshwar Lodhi"
                  required
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-muted mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="worker9@kachrabazar.in"
                  required
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-muted mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98260 00000"
                  required
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase text-muted mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                  >
                    <option value="worker">Sanitation Worker</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-muted mb-1">Ward *</label>
                  <select
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white"
                  >
                    {wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-md"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
