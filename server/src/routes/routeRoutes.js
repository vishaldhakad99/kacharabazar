import express from 'express';
import {
  getRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  updateRouteStop,
} from '../controllers/routeController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getRoutes)
  .post(restrictTo('admin'), createRoute);

router.route('/:id')
  .get(getRouteById)
  .patch(updateRoute);

router.patch('/:id/stops/:stopId', updateRouteStop);

export default router;
