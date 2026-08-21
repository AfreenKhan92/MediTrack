import express from 'express';
import {
  registerUser,
  authUser,
  getUserProfile,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, authUser);
router.get('/profile', protect, getUserProfile);
router.put('/change-password', protect, changePassword);

export default router;
