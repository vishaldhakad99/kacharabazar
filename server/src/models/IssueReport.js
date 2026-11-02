import mongoose from 'mongoose';

const issueReportSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      default: null,
    },
    type: {
      type: String,
      enum: ['blocked_access', 'overflowing_bin', 'vehicle_breakdown', 'citizen_dispute', 'road_construction', 'other'],
      required: [true, 'Issue type is required'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved'],
      default: 'open',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

issueReportSchema.index({ status: 1, createdAt: -1 });

const IssueReport = mongoose.model('IssueReport', issueReportSchema);
export default IssueReport;
