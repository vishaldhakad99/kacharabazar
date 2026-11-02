import mongoose from 'mongoose';

const redemptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      required: true,
    },
    pointsSpent: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['issued', 'fulfilled', 'cancelled'],
      default: 'issued',
      index: true,
    },
    fulfilledAt: {
      type: Date,
      default: null,
    },
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

redemptionSchema.index({ user: 1, createdAt: -1 });

const Redemption = mongoose.model('Redemption', redemptionSchema);
export default Redemption;
