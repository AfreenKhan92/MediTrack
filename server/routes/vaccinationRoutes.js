import express from 'express';
import {
  createVaccination,
  deleteVaccination,
  getVaccinationById,
  getVaccinations,
  updateVaccination,
} from '../controllers/vaccinationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateVaccination } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getVaccinations)
  .post(protect, validateVaccination, createVaccination);

router.route('/:id')
  .get(protect, getVaccinationById)
  .put(protect, validateVaccination, updateVaccination)
  .delete(protect, deleteVaccination);

export default router;