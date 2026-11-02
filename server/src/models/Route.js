import mongoose from 'mongoose';

const routeStopSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupRequest',
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reached', 'completed', 'skipped'],
      default: 'pending',
    },
    reachedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const routeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    stops: [routeStopSchema],
    scheduledFor: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed'],
      default: 'scheduled',
      index: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

routeSchema.index({ ward: 1, status: 1 });
routeSchema.index({ worker: 1, scheduledFor: -1 });

const Route = mongoose.model('Route', routeSchema);
export default Route;
