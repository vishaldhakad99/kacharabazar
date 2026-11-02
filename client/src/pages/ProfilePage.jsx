import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Award,
  Calendar,
  Building,
  Save,
  ShieldCheck,
  Sparkles,
  Flame,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [wards, setWards] = useState([]);

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [wardId, setWardId] = useState(user?.ward?._id || user?.ward || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setWardId(user.ward?._id || user.ward || '');
    }

    const fetchWards = async () => {
      try {
        const res = await api.get('/wards');
        setWards(res.data.wards || []);
      } catch (err) {
        // Ignore
      }
    };
    fetchWards();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await api.patch('/auth/profile', {
        name,
        phone,
        address,
        ward: wardId || undefined,
      });

      if (res.data?.user) {
        updateUser(res.data.user);
      }
      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      await api.patch('/auth/password', {
        currentPassword,
        newPassword,
      });

      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">Administrator</span>;
      case 'worker':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Sanitation Worker</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Civic Citizen</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-3xl shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div className="text-center sm:text-left flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900 font-heading">
                {user?.name}
              </h1>
              {getRoleBadge(user?.role)}
            </div>
            <p className="text-stone-500 text-sm flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-4 h-4 text-stone-400" />
              {user?.email}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-stone-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined: {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                City: Bhopal, MP
              </span>
            </div>
          </div>

          {user?.role === 'citizen' && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center min-w-[140px]">
              <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Eco Balance
              </div>
              <div className="text-2xl font-black text-emerald-700">
                {user?.ecoBalance || 0}
                <span className="text-xs font-normal text-emerald-600 ml-1">pts</span>
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                {user?.streakCount || 0} Day Streak
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-stone-100">
            <User className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-stone-900">Personal Information</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Ward / Jurisdiction
              </label>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Select Ward</option>
                {wards.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Residential / Street Address
              </label>
              <textarea
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no., street, landmark..."
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-stone-100">
              <Lock className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-stone-900">Security & Password</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start gap-2 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  Passwords are encrypted using bcrypt salted hashes. Keep your credentials secure to protect your eco-points balance.
                </span>
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
