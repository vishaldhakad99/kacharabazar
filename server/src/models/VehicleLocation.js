import mongoose from 'mongoose';

const vehicleLocationSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
      index: true,
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
    speed: {
      type: Number,
      default: 0, // km/h
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// GeoJSON 2dsphere index
vehicleLocationSchema.index({ location: '2dsphere' });

// TTL index to automatically remove location records after 24 hours (86400 seconds)
vehicleLocationSchema.index({ at: 1 }, { expireAfterSeconds: 86400 });

const VehicleLocation = mongoose.model('VehicleLocation', vehicleLocationSchema);
export default VehicleLocation;
