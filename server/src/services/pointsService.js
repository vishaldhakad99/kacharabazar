import { User, EcoPointTransaction, Notification, PickupRequest, DumpReport } from '../models/index.js';
import { ECO_RULES } from '../config/ecoRules.js';
import { notifyUser } from './socket.js';

/**
 * Atomically credit eco-points to a user with double-credit protection and streak calculation
 */
export const creditPoints = async ({ userId, amount, reason, refModel = null, refId = null }) => {
  if (amount <= 0) return null;

  // 1. Guard against double crediting for the same pickup/dump/feedback
  if (refModel && refId) {
    const existing = await EcoPointTransaction.findOne({
      user: userId,
      refModel,
      refId,
      reason,
      type: 'earn',
    });
    if (existing) {
      console.warn(`[Points] Double credit prevented for user ${userId}, ${refModel}:${refId}`);
      return existing;
    }
  }

  // 2. Fetch user to update balance atomically
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for point credit');
  }

  const newBalance = (user.ecoBalance || 0) + amount;
  const newLifetime = (user.lifetimePoints || 0) + amount;

  // 3. Check streak bonus if this is for a pickup request
  let streakBonusGiven = false;
  let streakCount = user.streakCount || 0;

  if (refModel === 'PickupRequest') {
    const now = new Date();
    if (user.lastPickupDate) {
      const last = new Date(user.lastPickupDate);
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streakCount += 1;
      } else if (diffDays > 1) {
        streakCount = 1;
      }
    } else {
      streakCount = 1;
    }
    user.lastPickupDate = now;
    user.streakCount = streakCount;

    // Check if 7-day streak reached
    if (streakCount >= 7 && streakCount % 7 === 0) {
      streakBonusGiven = true;
    }
  }

  user.ecoBalance = newBalance;
  user.lifetimePoints = newLifetime;
  await user.save();

  // 4. Record the primary ledger transaction
  const transaction = await EcoPointTransaction.create({
    user: userId,
    type: 'earn',
    amount,
    reason,
    refModel,
    refId,
    balanceAfter: newBalance,
  });

  // 5. Create notification and emit live socket event
  const notification = await Notification.create({
    user: userId,
    title: '🌿 Eco-Points Credited!',
    body: `You earned +${amount} points for: ${reason}. Current balance: ${newBalance} pts.`,
    type: 'points_earned',
    link: '/dashboard/points',
  });

  notifyUser(userId.toString(), {
    type: 'points:earned',
    amount,
    reason,
    balance: newBalance,
    lifetimePoints: newLifetime,
    notification,
  });

  // 6. If streak bonus unlocked, award bonus
  if (streakBonusGiven) {
    const bonusAmount = ECO_RULES.POINTS.STREAK_7_DAYS;
    const bonusBalance = user.ecoBalance + bonusAmount;
    user.ecoBalance = bonusBalance;
    user.lifetimePoints = user.lifetimePoints + bonusAmount;
    await user.save();

    await EcoPointTransaction.create({
      user: userId,
      type: 'earn',
      amount: bonusAmount,
      reason: '🔥 7-Day Waste Segregation Streak Bonus!',
      refModel: 'StreakBonus',
      refId: user._id,
      balanceAfter: bonusBalance,
    });

    const streakNotif = await Notification.create({
      user: userId,
      title: '🔥 7-Day Streak Master!',
      body: `Incredible dedication! You earned a +${bonusAmount} points bonus for segregating waste 7 pickups in a row!`,
      type: 'points_earned',
      link: '/dashboard/points',
    });

    notifyUser(userId.toString(), {
      type: 'points:earned',
      amount: bonusAmount,
      reason: '7-Day Streak Bonus',
      balance: bonusBalance,
      lifetimePoints: user.lifetimePoints,
      notification: streakNotif,
    });
  }

  return transaction;
};

/**
 * Calculate citizen impact statistics (kg segregated, CO2 saved, current tier)
 */
export const calculateCitizenImpact = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Count verified pickups
  const verifiedPickupsCount = await PickupRequest.countDocuments({
    citizen: userId,
    status: 'verified',
  });

  // Estimate waste kg segregated
  const kgSegregated = Math.round(verifiedPickupsCount * ECO_RULES.METRICS.AVG_KG_PER_PICKUP * 10) / 10;
  // Estimate CO2 avoided
  const co2SavedKg = Math.round(kgSegregated * ECO_RULES.METRICS.CO2_SAVED_PER_KG_KG * 10) / 10;

  // Determine Tier
  const lifetime = user.lifetimePoints || 0;
  let currentTier = ECO_RULES.TIERS[0];
  let nextTier = ECO_RULES.TIERS[1];

  for (let i = 0; i < ECO_RULES.TIERS.length; i++) {
    if (lifetime >= ECO_RULES.TIERS[i].minPoints && lifetime <= ECO_RULES.TIERS[i].maxPoints) {
      currentTier = ECO_RULES.TIERS[i];
      nextTier = ECO_RULES.TIERS[i + 1] || null;
      break;
    }
  }

  const progressToNext = nextTier
    ? Math.min(
        100,
        Math.round(
          ((lifetime - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
        )
      )
    : 100;

  return {
    ecoBalance: user.ecoBalance || 0,
    lifetimePoints: user.lifetimePoints || 0,
    streakCount: user.streakCount || 0,
    verifiedPickupsCount,
    kgSegregated,
    co2SavedKg,
    currentTier,
    nextTier,
    progressToNext,
  };
};
