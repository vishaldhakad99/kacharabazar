import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CalendarPlus,
  Truck,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  ArrowLeft,
  XCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import api from '../../api/client';
import StatusTimeline from '../../components/common/StatusTimeline';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

export const PickupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchPickup = async () => {
    try {
      const res = await api.get(`/pickups/${id}`);
      if (res.success && res.pickup) {
        setPickup(res.pickup);
        if (res.pickup.rating) {
          setRating(res.pickup.rating);
          setFeedback(res.pickup.feedback || '');
        }
      }
    } catch (err) {
      toast.error('Failed to load pickup request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickup();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this pickup request?')) return;

    setCancelling(true);
    try {
      const res = await api.patch(`/pickups/${id}/cancel`);
      if (res.success) {
        toast.success('Pickup request cancelled.');
        fetchPickup();
      }
    } catch (err) {
      // Handled
    } finally {
      setCancelling(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const res = await api.post(`/pickups/${id}/feedback`, { rating, feedback });
      if (res.success) {
        toast.success(res.message || 'Feedback submitted! +5 bonus eco-points earned.');
        fetchPickup();
      }
    } catch (err) {
      // Handled
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  if (!pickup) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted">Pickup request not found.</p>
        <Link to="/dashboard" className="text-xs text-primary-600 font-bold underline mt-2 block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top back button & title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pickups
        </button>

        {['pending', 'assigned'].includes(pickup.status) && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Request'}
          </button>
        )}
      </div>

      {/* Main card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400 tracking-wider">
              Pickup Request #{pickup._id.substring(pickup._id.length - 6).toUpperCase()}
            </span>
            <h1 className="text-xl sm:text-2xl font-heading font-black text-ink dark:text-white capitalize">
              {pickup.wasteType} Waste Collection
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                pickup.status === 'verified'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : pickup.status === 'collected'
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : pickup.status === 'cancelled'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {pickup.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="py-2">
          <StatusTimeline
            status={pickup.status}
            segregation={pickup.segregation}
            points={pickup.pointsAwarded}
          />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs">
          <div>
            <span className="text-muted block text-[11px] mb-0.5">Pickup Address</span>
            <p className="font-semibold text-ink dark:text-white">{pickup.address}</p>
          </div>

          <div>
            <span className="text-muted block text-[11px] mb-0.5">Scheduled Slot</span>
            <p className="font-semibold text-ink dark:text-white flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary-600" /> {pickup.slot}
            </p>
          </div>

          <div>
            <span className="text-muted block text-[11px] mb-0.5">Municipal Ward</span>
            <p className="font-semibold text-ink dark:text-white">
              {pickup.ward?.name} ({pickup.ward?.code})
            </p>
          </div>

          <div>
            <span className="text-muted block text-[11px] mb-0.5">Assigned Vehicle</span>
            <p className="font-semibold text-ink dark:text-white flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-accent-500" />
              {pickup.assignedVehicle ? pickup.assignedVehicle.regNumber : 'Awaiting Route Allocation'}
            </p>
          </div>
        </div>

        {/* Worker Verification Details */}
        {pickup.status === 'verified' && (
          <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-600" />
                <span className="font-bold text-xs text-primary-900 dark:text-primary-100">
                  Doorstep Quality Inspection Completed
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-accent-500 text-white font-bold text-xs">
                +{pickup.pointsAwarded} Eco-Points Awarded
              </span>
            </div>

            <p className="text-xs text-muted dark:text-gray-300">
              Segregation Quality:{' '}
              <strong className="capitalize text-primary-800 dark:text-primary-200">
                {pickup.segregation}
              </strong>
            </p>
            {pickup.workerNotes && (
              <p className="text-xs text-muted italic">
                Worker Notes: "{pickup.workerNotes}"
              </p>
            )}
          </div>
        )}

        {/* Feedback Section (If verified) */}
        {pickup.status === 'verified' && (
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-ink dark:text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Rate the Sanitation Service
                </h3>
                <p className="text-[11px] text-muted">
                  Earn +5 bonus eco-points for submitting honest feedback!
                </p>
              </div>

              {!pickup.rating && (
                <span className="px-2 py-0.5 rounded-full bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-300 text-xs font-bold">
                  +5 pts
                </span>
              )}
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-ink dark:text-white ml-2">
                  {rating} of 5 Stars
                </span>
              </div>

              <div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Was the vehicle on time? Did the worker handle the waste properly?"
                  rows={2}
                  className="w-full p-3 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                {submittingFeedback ? 'Saving...' : 'Submit Service Rating'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupDetailPage;
