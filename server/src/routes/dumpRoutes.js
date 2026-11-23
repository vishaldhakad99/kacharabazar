import express from 'express';
import {
  reportDump,
  getPublicDumps,
  getDumps,
  assignDump,
  clearDump,
} from '../controllers/dumpController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { reportDumpValidator } from '../middleware/validators.js';

const router = express.Router();

// Public route for public landing page hotspot map
router.get('/public', getPublicDumps);

// Protected routes
router.use(protect);

router.route('/')
  .post(restrictTo('citizen', 'admin'), reportDumpValidator, reportDump)
  .get(getDumps);

router.patch('/:id/assign', restrictTo('admin'), assignDump);
router.patch('/:id/clear', restrictTo('worker', 'admin'), clearDump);

export default router;
