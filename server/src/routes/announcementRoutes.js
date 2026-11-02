import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
} from '../controllers/announcementController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAnnouncements);
router.post('/', protect, restrictTo('admin'), createAnnouncement);

export default router;
