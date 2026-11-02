import mongoose from 'mongoose';

const pickupRequestSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
      index: true,
    },
    wasteType: {
      type: String,
      enum: ['wet', 'dry', 'recyclable', 'e-waste', 'hazardous'],
      required: [true, 'Waste type is required'],
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
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
    photo: {
      type: String,
      default: '',
    },
    slot: {
      type: String,
      enum: ['07:00 - 09:00', '09:00 - 11:00', '11:00 - 13:00', '15:00 - 17:00'],
      default: '07:00 - 09:00',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'on_the_way', 'collected', 'verified', 'missed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    collectedAt: {
      type: Date,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    segregation: {
      type: String,
      enum: ['correct', 'partial', 'none', null],
      default: null,
    },
    workerNotes: {
      type: String,
      default: '',
    },
    verificationPhoto: {
      type: String,
      default: '',
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

pickupRequestSchema.index({ location: '2dsphere' });
pickupRequestSchema.index({ citizen: 1, createdAt: -1 });
pickupRequestSchema.index({ ward: 1, status: 1 });
pickupRequestSchema.index({ assignedWorker: 1, status: 1 });
pickupRequestSchema.index({ status: 1, createdAt: -1 });

const PickupRequest = mongoose.model('PickupRequest', pickupRequestSchema);
export default PickupRequest;
