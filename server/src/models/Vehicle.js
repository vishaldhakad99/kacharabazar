import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    regNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['tipper_truck', 'compactor', 'electric_cart', 'mini_truck'],
      default: 'tipper_truck',
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
      index: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['idle', 'on_route', 'maintenance'],
      default: 'idle',
      index: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.4126, 23.2599], // Bhopal center fallback
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    capacityKg: {
      type: Number,
      default: 1500,
    },
  },
  {
    timestamps: true,
  }
);

vehicleSchema.index({ currentLocation: '2dsphere' });
vehicleSchema.index({ ward: 1, status: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
