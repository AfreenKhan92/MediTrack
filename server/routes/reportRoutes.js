import express from 'express';
import {
  uploadReport,
  getReports,
  deleteReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.single('file'), uploadReport)
  .get(protect, getReports);

router.route('/:id')
  .delete(protect, deleteReport);

export default router;
