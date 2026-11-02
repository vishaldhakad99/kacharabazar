import mongoose from 'mongoose';

const dumpReportSchema = new mongoose.Schema(
  {
    reporter: {
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
      trim: true,
    },
    photoBefore: {
      type: String,
      required: [true, 'Photo of the garbage hotspot is required'],
    },
    photoAfter: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'cleared'],
      default: 'open',
      index: true,
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    clearedAt: {
      type: Date,
      default: null,
    },
    workerNotes: {
      type: String,
      default: '',
    },
    bonusPointsCredited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

dumpReportSchema.index({ location: '2dsphere' });
dumpReportSchema.index({ ward: 1, status: 1 });
dumpReportSchema.index({ status: 1, createdAt: -1 });

const DumpReport = mongoose.model('DumpReport', dumpReportSchema);
export default DumpReport;
