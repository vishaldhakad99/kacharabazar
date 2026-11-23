import express from 'express';
import {
  createPickup,
  getPickups,
  getPickupById,
  cancelPickup,
  assignPickup,
  updatePickupStatus,
  verifyPickup,
  submitFeedback,
} from '../controllers/pickupController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { createPickupValidator, verifyPickupValidator } from '../middleware/validators.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(restrictTo('citizen', 'admin'), createPickupValidator, createPickup)
  .get(getPickups);

router.get('/:id', getPickupById);
router.patch('/:id/cancel', cancelPickup);
router.patch('/:id/assign', restrictTo('admin'), assignPickup);
router.patch('/:id/status', restrictTo('worker', 'admin'), updatePickupStatus);
router.post('/:id/verify', restrictTo('worker', 'admin'), verifyPickupValidator, verifyPickup);
router.post('/:id/feedback', restrictTo('citizen', 'admin'), submitFeedback);

export default router;
