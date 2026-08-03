import express from 'express';
import {
  createReminder,
  deleteReminder,
  getReminderById,
  getReminders,
  updateReminder,
} from '../controllers/reminderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateReminder } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getReminders)
  .post(protect, validateReminder, createReminder);

router.route('/:id')
  .get(protect, getReminderById)
  .put(protect, validateReminder, updateReminder)
  .delete(protect, deleteReminder);

export default router;