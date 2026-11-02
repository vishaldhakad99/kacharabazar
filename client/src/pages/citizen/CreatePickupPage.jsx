import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  Apple,
  Package,
  Recycle,
  Cpu,
  AlertTriangle,
  Clock,
  Camera,
  MapPin,
  ArrowRight,
  Upload,
} from 'lucide-react';
import api from '../../api/client';
import useAuthStore from '../../store/useAuthStore';
import MapPicker from '../../components/common/MapPicker';
import toast from 'react-hot-toast';

const wasteCategories = [
  {
    id: 'wet',
    name: 'Wet Organic Waste',
    desc: 'Kitchen scraps, vegetable peels, leftover food, tea leaves',
    color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300',
    icon: Apple,
  },
  {
    id: 'dry',
    name: 'Dry Recyclable',
    desc: 'Paper, cardboard cartons, plastics, dry packaging',
    color: 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 text-sky-800 dark:text-sky-300',
    icon: Package,
  },
  {
    id: 'recyclable',
    name: 'Metals & Glass',
    desc: 'Tin cans, glass bottles, metal caps, aluminum foil',
    color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300',
    icon: Recycle,
  },
  {
    id: 'e-waste',
    name: 'E-Waste & Electronics',
    desc: 'Old phones, batteries, chargers, CFL bulbs, cables',
    color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300',
    icon: Cpu,
  },
  {
    id: 'hazardous',
    name: 'Domestic Hazardous',
    desc: 'Expired medicine, sanitizers, paint cans, pesticides',
    color: 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-800 dark:text-red-300',
    icon: AlertTriangle,
  },
];

const timeSlots = [
  '07:00 - 09:00',
  '09:00 - 11:00',
  '11:00 - 13:00',
  '15:00 - 17:00',
];

export const CreatePickupPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [wasteType, setWasteType] = useState('wet');
  const [address, setAddress] = useState(user?.address || '');
  const [slot, setSlot] = useState(timeSlots[0]);
  const [coordinates, setCoordinates] = useState(
    user?.ward?.center?.coordinates || [77.4126, 23.2599]
  );
  const [photo, setPhoto] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5 MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.success && res.url) {
        setPhoto(res.url);
        toast.success('Photo uploaded successfully.');
      }
    } catch (err) {
      toast.error('Photo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Please enter your pickup address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/pickups', {
        wasteType,
        address,
        slot,
        location: {
          type: 'Point',
          coordinates,
        },
        photo,
        ward: user?.ward?._id || user?.ward,
      });

      if (res.success && res.pickup) {
        toast.success('Pickup request submitted to your ward team!');
        navigate(`/dashboard/pickups/${res.pickup._id}`);
      }
    } catch (err) {
      // Interceptor handles toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
          Citizen Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
          <CalendarPlus className="w-7 h-7 text-primary-600" />
          Schedule Waste Pickup
        </h1>
        <p className="text-xs text-muted">
          Your ward collection vehicle will visit your doorstep. Ensure 100% correct segregation
          to earn +20 eco-points!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Waste Type Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            1. Select Waste Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wasteCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = wasteType === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setWasteType(cat.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? `${cat.color} ring-2 ring-primary-500 shadow-sm font-semibold`
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-gray-800 shadow-sm mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-ink dark:text-white leading-tight">
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-muted dark:text-gray-400 mt-1 leading-normal">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Map Location Picker */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            2. Pin Doorstep Location *
          </label>
          <MapPicker
            initialCoords={coordinates}
            onLocationChange={(newCoords) => setCoordinates(newCoords)}
          />
        </div>

        {/* 3. Address & Time Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              3. House / Flat Address *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-muted absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 204, Block C, Arera Colony, Bhopal"
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              4. Preferred Time Slot *
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-muted absolute left-3 top-3 pointer-events-none" />
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {timeSlots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4. Optional Photo of Waste */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            5. Optional Photo of Segregated Waste
          </label>
          <div className="flex items-center gap-4">
            <label className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-xs font-semibold text-ink dark:text-gray-200 inline-flex items-center gap-2 shadow-sm transition-colors">
              <Upload className="w-4 h-4 text-primary-600" />
              <span>{uploading ? 'Uploading...' : 'Choose Photo (Max 5MB)'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {photo && (
              <div className="flex items-center gap-2">
                <img
                  src={photo}
                  alt="Waste preview"
                  className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-sm"
                />
                <span className="text-xs text-emerald-600 font-semibold">Attached ✓</span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-6 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Confirm Pickup Request <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePickupPage;
