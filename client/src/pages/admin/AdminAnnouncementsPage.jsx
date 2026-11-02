import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import {
  Megaphone,
  Plus,
  Send,
  AlertTriangle,
  Info,
  Flame,
  Calendar,
  Building,
  Radio,
  CheckCircle2,
} from 'lucide-react';

const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [wardId, setWardId] = useState('');
  const [priority, setPriority] = useState('normal');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, wardRes] = await Promise.all([
        api.get('/announcements'),
        api.get('/wards'),
      ]);
      setAnnouncements(annRes.data.announcements || []);
      setWards(wardRes.data.wards || []);
    } catch (err) {
      toast.error('Failed to load announcements data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter announcement title and message content.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        body: body.trim(),
        priority,
        ward: wardId || null,
      };

      const res = await api.post('/announcements', payload);
      toast.success(res.data.message || 'Announcement broadcasted live to citizens!');
      setTitle('');
      setBody('');
      setWardId('');
      setPriority('normal');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to broadcast announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
            <Flame className="w-3.5 h-3.5" />
            Urgent Notice
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            High Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <Info className="w-3.5 h-3.5" />
            Information
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-emerald-600" />
            <h1 className="text-2xl font-bold text-stone-900 font-heading">
              Civic Announcements & Broadcasts
            </h1>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Publish city-wide or ward-specific public hygiene advisories, route changes, and festival cleanup drives.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-semibold">
          <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          Real-Time Push Enabled
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Announcement */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-stone-100">
              <Send className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-stone-900">Post Announcement</h2>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special E-Waste Drive This Sunday"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Target Ward / Jurisdiction
                </label>
                <select
                  value={wardId}
                  onChange={(e) => setWardId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">🌐 All Wards (City-wide Bhopal)</option>
                  {wards.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Select a ward to notify residents of that specific ward, or broadcast to all Bhopal citizens.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="normal">Normal (Routine Notice)</option>
                  <option value="high">High (Service Change / Alert)</option>
                  <option value="urgent">Urgent (Emergency / Monsoon Alert)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Detailed Message *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Provide instructions, timings, and relevant details for citizens..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Broadcasting...' : 'Broadcast Announcement'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: History of Announcements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-stone-900 text-lg">
              Published Announcements ({announcements.length})
            </h2>
            <span className="text-xs text-stone-500">Live feed for Bhopal citizens</span>
          </div>

          {announcements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500">
              No civic announcements posted yet. Use the form on the left to broadcast your first message.
            </div>
          ) : (
            announcements.map((ann) => (
              <div
                key={ann._id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(ann.priority)}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
                      <Building className="w-3.5 h-3.5 text-stone-500" />
                      {ann.ward ? `${ann.ward.name} (${ann.ward.code})` : 'All Bhopal Wards'}
                    </span>
                  </div>

                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(ann.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <h3 className="font-bold text-base text-stone-900">{ann.title}</h3>
                <p className="text-sm text-stone-600 whitespace-pre-line leading-relaxed">
                  {ann.body}
                </p>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span>Posted by: {ann.createdBy?.name || 'Municipal Admin'}</span>
                  <span className="text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Delivered to Citizen Dashboards
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncementsPage;
