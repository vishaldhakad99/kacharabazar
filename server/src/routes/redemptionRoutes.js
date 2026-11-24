import express from 'express';
import {
  getMyRedemptions,
  getAllRedemptions,
  updateRedemptionStatus,
} from '../controllers/rewardController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Citizen routes
router.get('/me', restrictTo('citizen', 'admin'), getMyRedemptions);

// Admin routes
router.get('/', restrictTo('admin'), getAllRedemptions);
router.patch('/:id', restrictTo('admin'), updateRedemptionStatus);

export default router;
