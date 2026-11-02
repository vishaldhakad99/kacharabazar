import express from 'express';
import {
  createIssue,
  getIssues,
  updateIssue,
} from '../controllers/issueController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('worker', 'admin'), createIssue);
router.get('/', restrictTo('admin'), getIssues);
router.patch('/:id', restrictTo('admin'), updateIssue);

export default router;
