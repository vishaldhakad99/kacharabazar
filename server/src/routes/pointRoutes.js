import express from 'express';
import { getPointsSummary, getPointsHistory } from '../controllers/pointController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getPointsSummary);
router.get('/history', getPointsHistory);

export default router;
