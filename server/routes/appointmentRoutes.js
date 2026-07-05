import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateAppointment } from '../middleware/validationMiddleware.js';

const router = express.Router();

// POST   /api/appointments          - Create appointment (with validation)
// GET    /api/appointments          - List all (supports ?status=&familyMember= filters)
router.route('/')
  .post(protect, validateAppointment, createAppointment)
  .get(protect, getAppointments);

// GET    /api/appointments/:id      - Get single appointment
// PUT    /api/appointments/:id      - Update appointment
// DELETE /api/appointments/:id      - Delete appointment
router.route('/:id')
  .get(protect, getAppointmentById)
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

export default router;
