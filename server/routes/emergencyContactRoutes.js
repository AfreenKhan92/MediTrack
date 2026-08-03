import express from 'express';
import {
  getContacts,
  createContact,
  getContactById,
  updateContact,
  deleteContact,
} from '../controllers/emergencyContactController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getContacts)
  .post(protect, createContact);

router.route('/:id')
  .get(protect, getContactById)
  .put(protect, updateContact)
  .delete(protect, deleteContact);

export default router;
