import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Recycle, User, Mail, Phone, Lock, MapPin, ArrowRight } from 'lucide-react';
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
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-6 sm:py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-600/30">
              <Recycle className="w-7 h-7 text-emerald-300" />
            </div>
          </Link>
          <h1 className="text-2xl font-heading font-black text-ink dark:text-white">
            Join Kachra Bazar Bhopal
          </h1>
          <p className="text-xs text-muted">
            Create your citizen profile, request pickups, and earn eco-points for proper waste segregation.
          </p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-soft-lg space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink dark:text-gray-200 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Pooja Sharma"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink dark:text-gray-200 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="pooja@gmail.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-gray-200 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98260 00000"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink dark:text-gray-200 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
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
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink dark:text-gray-200 mb-1">
                  Bhopal Ward *
                </label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
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
              <label className="block text-xs font-semibold text-ink dark:text-gray-200 mb-1">
                House / Street Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Flat 302, Sagar Royal Villas, Arera Colony"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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

          <div className="pt-2 text-center text-xs text-muted border-t border-gray-100 dark:border-gray-800">
            Already registered?{' '}
            <Link
              to="/login"
              className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
