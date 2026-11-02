import express from 'express';
import {
  getRewards,
  redeemReward,
  getMyRedemptions,
  getAllRedemptions,
  updateRedemptionStatus,
  createReward,
  updateReward,
  deleteReward,
} from '../controllers/rewardController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Catalog is visible publicly or with auth
router.get('/', getRewards);

// Protected routes
router.use(protect);

router.post('/:id/redeem', restrictTo('citizen', 'admin'), redeemReward);
router.get('/my-redemptions', restrictTo('citizen', 'admin'), getMyRedemptions);

// Admin rewards and redemptions management
router.get('/redemptions', restrictTo('admin'), getAllRedemptions);
router.patch('/redemptions/:id', restrictTo('admin'), updateRedemptionStatus);
router.post('/', restrictTo('admin'), createReward);
router.patch('/:id', restrictTo('admin'), updateReward);
router.delete('/:id', restrictTo('admin'), deleteReward);

export default router;
