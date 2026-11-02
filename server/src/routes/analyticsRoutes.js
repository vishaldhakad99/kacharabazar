import express from 'express';
import {
  getOverview,
  getPickupsTrend,
  getWasteSplit,
  getWardPerformance,
  getSegregationTrend,
} from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/overview', getOverview);
router.get('/pickups-trend', getPickupsTrend);
router.get('/waste-split', getWasteSplit);
router.get('/ward-performance', getWardPerformance);
router.get('/segregation-trend', getSegregationTrend);

export default router;
