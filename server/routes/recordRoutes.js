import express from 'express';
import {
  getRecords,
  createRecord,
  deleteRecord,
} from '../controllers/recordController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getRecords)
  .post(protect, createRecord);

router.route('/:id')
  .delete(protect, deleteRecord);

export default router;
