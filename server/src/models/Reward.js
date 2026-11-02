import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Reward title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Reward description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['utilities', 'goods', 'vouchers', 'groceries'],
      default: 'vouchers',
      index: true,
    },
    pointsCost: {
      type: Number,
      required: [true, 'Points cost is required'],
      min: 1,
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
    partnerName: {
      type: String,
      default: 'Kachra Bazar Green Partners',
      trim: true,
    },
    terms: {
      type: String,
      default: 'Valid for 90 days from redemption date. Non-transferable.',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

rewardSchema.index({ isActive: 1, pointsCost: 1 });

const Reward = mongoose.model('Reward', rewardSchema);
export default Reward;
