import express from 'express';
import {
  getWards,
  getWardById,
  createWard,
  updateWard,
  deleteWard,
} from '../controllers/wardController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getWards);
router.get('/:id', getWardById);

// Admin-only management
router.post('/', protect, restrictTo('admin'), createWard);
router.patch('/:id', protect, restrictTo('admin'), updateWard);
router.delete('/:id', protect, restrictTo('admin'), deleteWard);

export default router;
