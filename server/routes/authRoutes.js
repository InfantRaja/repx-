import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  saveOnboarding,
  forgotPassword,
  googleAuth,
  googleCallback,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/onboarding', protect, saveOnboarding);
router.post('/forgot-password', forgotPassword);

// Google OAuth
router.get('/google', googleAuth);
router.post('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
