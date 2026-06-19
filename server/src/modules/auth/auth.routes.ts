import { Router } from 'express';
import {
  register,
  login,
  getMe,
  requestOTP,
  verifyOTP,
  resetPassword,
  googleLogin,
} from './auth.controller';
import { protect } from '../../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

export default router;
