import { Reward, Redemption, User, EcoPointTransaction, Notification } from '../models/index.js';
import { notifyUser } from '../services/socket.js';

// Helper to generate realistic coupon code
const generateCouponCode = (category = 'KB') => {
  const prefix = category.substring(0, 4).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `KB-${prefix}-${randomNum}-${randomChars}`;
};

// @desc    Get active rewards catalog
// @route   GET /api/rewards
// @access  Public / Private
export const getRewards = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = {};

    // Only active rewards for citizens/public, admin can see all
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
    }
    if (category) query.category = category;

    const rewards = await Reward.find(query).sort({ pointsCost: 1 });

    res.status(200).json({
      success: true,
      count: rewards.length,
      rewards,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Redeem a reward with eco-points
// @route   POST /api/rewards/:id/redeem
// @access  Private/Citizen
export const redeemReward = async (req, res, next) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward || !reward.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found or currently unavailable.',
      });
    }

    if (reward.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this reward is out of stock.',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if ((user.ecoBalance || 0) < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient eco-points balance. You have ${user.ecoBalance || 0} pts, but this reward requires ${reward.pointsCost} pts.`,
      });
    }

    // Deduct points atomically
    const newBalance = user.ecoBalance - reward.pointsCost;
    user.ecoBalance = newBalance;
    await user.save();

    // Decrement stock
    reward.stock = Math.max(0, reward.stock - 1);
    await reward.save();

    // Generate unique coupon code
    const code = generateCouponCode(reward.category);

    // Create redemption record
    const redemption = await Redemption.create({
      user: req.user.id,
      reward: reward._id,
      pointsSpent: reward.pointsCost,
      code,
      status: 'issued',
    });

    // Record immutable ledger transaction
    await EcoPointTransaction.create({
      user: req.user.id,
      type: 'redeem',
      amount: reward.pointsCost,
      reason: `Redeemed Reward: ${reward.title} (Code: ${code})`,
      refModel: 'Redemption',
      refId: redemption._id,
      balanceAfter: newBalance,
    });

    // Create notification
    const notif = await Notification.create({
      user: req.user.id,
      title: '🎁 Reward Redeemed Successfully!',
      body: `You successfully redeemed "${reward.title}". Your coupon code is ${code}. Present this to the partner store or bill counter.`,
      type: 'redemption',
      link: '/dashboard/rewards',
    });

    notifyUser(req.user.id, {
      type: 'reward:redeemed',
      code,
      rewardTitle: reward.title,
      balance: newBalance,
      notification: notif,
    });

    const populatedRedemption = await Redemption.findById(redemption._id).populate('reward');

    res.status(200).json({
      success: true,
      message: 'Reward redeemed successfully! Your coupon code has been generated.',
      redemption: populatedRedemption,
      remainingBalance: newBalance,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's redeemed rewards
// @route   GET /api/redemptions/me
// @access  Private/Citizen
export const getMyRedemptions = async (req, res, next) => {
  try {
    const redemptions = await Redemption.find({ user: req.user.id })
      .populate('reward')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: redemptions.length,
      redemptions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all redemptions (Admin)
// @route   GET /api/redemptions
// @access  Private/Admin
export const getAllRedemptions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Redemption.countDocuments(query);

    const redemptions = await Redemption.find(query)
      .populate('user', 'name phone email avatar address')
      .populate('reward')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      redemptions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update redemption status (fulfill)
// @route   PATCH /api/redemptions/:id
// @access  Private/Admin
export const updateRedemptionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const redemption = await Redemption.findById(req.params.id);

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Redemption record not found.',
      });
    }

    redemption.status = status;
    if (status === 'fulfilled') {
      redemption.fulfilledAt = new Date();
      redemption.fulfilledBy = req.user.id;
    }

    await redemption.save();

    res.status(200).json({
      success: true,
      message: `Redemption marked as ${status}.`,
      redemption,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new reward item
// @route   POST /api/rewards
// @access  Private/Admin
export const createReward = async (req, res, next) => {
  try {
    const { title, description, category, pointsCost, stock, image, partnerName, terms } = req.body;

    if (!title || !description || !pointsCost) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and pointsCost are required.',
      });
    }

    const reward = await Reward.create({
      title,
      description,
      category: category || 'vouchers',
      pointsCost: parseInt(pointsCost, 10),
      stock: stock !== undefined ? parseInt(stock, 10) : 100,
      image: image || '',
      partnerName: partnerName || 'Bhopal Municipal Green Initiative',
      terms: terms || 'Valid for 90 days from redemption date. Non-transferable.',
    });

    res.status(201).json({
      success: true,
      message: 'Reward added to catalog successfully.',
      reward,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update reward item
// @route   PATCH /api/rewards/:id
// @access  Private/Admin
export const updateReward = async (req, res, next) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reward updated successfully.',
      reward,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete reward item
// @route   DELETE /api/rewards/:id
// @access  Private/Admin
export const deleteReward = async (req, res, next) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reward removed from catalog.',
    });
  } catch (err) {
    next(err);
  }
};
