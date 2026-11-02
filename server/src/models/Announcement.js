import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Announcement body is required'],
      trim: true,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      default: null, // null means all wards (city-wide announcement)
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent'],
      default: 'normal',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ ward: 1, createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
