import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Camera,
  MapPin,
  Upload,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import api from '../../api/client';
import useAuthStore from '../../store/useAuthStore';
import MapPicker from '../../components/common/MapPicker';
import toast from 'react-hot-toast';

export const ReportDumpPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [coordinates, setCoordinates] = useState(
    user?.ward?.center?.coordinates || [77.4126, 23.2599]
  );
  const [photoBefore, setPhotoBefore] = useState('');
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
        setPhotoBefore(res.url);
        toast.success('Hotspot photo uploaded.');
      }
    } catch (err) {
      toast.error('Photo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoBefore) {
      toast.error('Please upload a photo of the garbage hotspot.');
      return;
    }
    if (!description.trim()) {
      toast.error('Please provide a short description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/dumps', {
        location: {
          type: 'Point',
          coordinates,
        },
        address,
        photoBefore,
        description,
        severity,
        ward: user?.ward?._id || user?.ward,
      });

      if (res.success) {
        toast.success('Garbage dump reported! Municipal team has been dispatched.');
        navigate('/dashboard/dumps');
      }
    } catch (err) {
      // Interceptor handles toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider">
          Community Action
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-ink dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-accent-500" />
          Report Roadside Garbage Hotspot
        </h1>
        <p className="text-xs text-muted">
          Report illegal dumping spots in Bhopal. Once our municipal team clears it with a verified
          after-photo, you will earn <strong className="text-accent-600">+30 bonus eco-points!</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload (Required) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            1. Photo of Hotspot *
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="px-5 py-3 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary-500 cursor-pointer text-xs font-semibold text-ink dark:text-gray-200 inline-flex items-center gap-2 shadow-sm transition-colors">
              <Camera className="w-5 h-5 text-accent-500" />
              <span>{uploading ? 'Uploading...' : 'Take or Upload Photo (Max 5MB)'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {photoBefore && (
              <div className="flex items-center gap-3">
                <img
                  src={photoBefore}
                  alt="Hotspot preview"
                  className="w-16 h-16 object-cover rounded-2xl border-2 border-emerald-500 shadow-sm"
                />
                <span className="text-xs text-emerald-600 font-bold">Photo Attached ✓</span>
              </div>
            )}
          </div>
        </div>

        {/* Location Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted">
            2. Pin Hotspot GPS Coordinates *
          </label>
          <MapPicker
            initialCoords={coordinates}
            onLocationChange={(newCoords) => setCoordinates(newCoords)}
          />
        </div>

        {/* Address & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
              3. Nearest Landmark / Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Behind MP Nagar Zone 2 Petrol Pump"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
              4. Hotspot Severity Level
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="low">Low (Small litter, few plastic bags)</option>
              <option value="medium">Medium (Overflowing bin, roadside heap)</option>
              <option value="high">High (Severe health hazard, blocking road)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1">
            5. Description & Remarks *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the nature of garbage (e.g. Rotten vegetables, construction debris, electronic scrap)..."
            required
            className="w-full p-3 rounded-xl text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-6 py-3 rounded-2xl bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Submit Hotspot Report <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportDumpPage;
