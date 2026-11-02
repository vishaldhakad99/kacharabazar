import mongoose from 'mongoose';

const ecoPointTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['earn', 'redeem'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    refModel: {
      type: String,
      enum: ['PickupRequest', 'DumpReport', 'Reward', 'Redemption', 'StreakBonus', 'Feedback', 'AdminAdjustment'],
      default: null,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes
ecoPointTransactionSchema.index({ user: 1, createdAt: -1 });

// Prevent double crediting for the same user + refModel + refId + reason
ecoPointTransactionSchema.index(
  { user: 1, refModel: 1, refId: 1, reason: 1 },
  {
    unique: true,
    partialFilterExpression: {
      refId: { $type: 'objectId' },
      type: 'earn',
    },
  }
);

const EcoPointTransaction = mongoose.model('EcoPointTransaction', ecoPointTransactionSchema);
export default EcoPointTransaction;
