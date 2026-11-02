import mongoose from 'mongoose';

const wardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ward name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Ward code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      default: 'Bhopal',
      trim: true,
    },
    center: {
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
    population: {
      type: Number,
      default: 25000,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

wardSchema.index({ center: '2dsphere' });

const Ward = mongoose.model('Ward', wardSchema);
export { Ward };
export default Ward;
