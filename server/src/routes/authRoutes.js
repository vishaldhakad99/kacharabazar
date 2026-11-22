import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  registerValidator,
  loginValidator,
  updatePasswordValidator,
} from '../middleware/validators.js';

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/password', protect, updatePasswordValidator, updatePassword);
router.patch('/profile', protect, updateProfile);

export default router;
