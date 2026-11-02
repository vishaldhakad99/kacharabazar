import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { updateProfile } from '../controllers/authController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Current user profile update
router.patch('/me', updateProfile);

// Admin only routes
router.use(restrictTo('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .patch(updateUser)
  .delete(deleteUser);

export default router;
