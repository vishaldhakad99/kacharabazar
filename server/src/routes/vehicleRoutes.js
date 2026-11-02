import express from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleLocation,
} from '../controllers/vehicleController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getVehicles)
  .post(restrictTo('admin'), createVehicle);

router.route('/:id')
  .get(getVehicleById)
  .patch(restrictTo('admin'), updateVehicle)
  .delete(restrictTo('admin'), deleteVehicle);

router.post('/:id/location', restrictTo('worker', 'admin'), updateVehicleLocation);

export default router;
