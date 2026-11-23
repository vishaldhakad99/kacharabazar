import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, User, Mail, Phone, Lock, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import api from '../api/client';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    ward: '',
    address: '',
  });
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const res = await api.get('/wards');
        const fetchedWards = res.wards || res.data?.wards || (Array.isArray(res) ? res : []);
        if (fetchedWards && fetchedWards.length > 0) {
          setWards(fetchedWards);
          setFormData((prev) => ({
            ...prev,
            ward: prev.ward || fetchedWards[0]._id,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch Bhopal wards:', err);
      }
    };
    fetchWards();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const payload = { ...formData };
    if (!payload.ward && wards.length > 0) {
      payload.ward = wards[0]._id;
    }

    setLoading(true);
    try {
      const user = await register(payload);
      if (user) {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-6 sm:py-12 relative">
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/25 group-hover:scale-105 transition-all">
              <Recycle className="w-6 h-6 text-emerald-200 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </Link>
          <h1 className="text-2xl font-heading font-black text-stone-900 dark:text-white">
            Join Kachra Bazar Bhopal
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Create your citizen profile, request door-to-door pickups, and earn verified eco-points.
          </p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-stone-200/80 dark:border-gray-800 shadow-soft-lg space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-gray-200 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Pooja Sharma"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-stone-50/80 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-gray-200 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="pooja@gmail.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-stone-50/80 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-gray-200 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98260 00000"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-stone-50/80 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-gray-200 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-stone-50/80 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-gray-200 mb-1">
                  Bhopal Ward *
                </label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-stone-50/80 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  {wards.length === 0 ? (
                    <option value="">Loading Bhopal Wards...</option>
                  ) : (
                    wards.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name} ({w.code})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-gray-200 mb-1">
                House / Street Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Flat 302, Sagar Royal Villas, Arera Colony"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-stone-50/80 dark:bg-gray-800 border border-stone-200 dark:border-gray-700 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Register as Citizen <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 text-center text-xs text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-gray-800">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
