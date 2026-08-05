import express from 'express';
import {
  uploadReport,
  getReports,
  getReportById,
  deleteReport,
  retryProcessing,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Collection routes: list all / upload new
router.route('/')
  .post(protect, upload.single('file'), uploadReport)
  .get(protect, getReports);

// Single report routes: get by ID / delete
router.route('/:id')
  .get(protect, getReportById)
  .delete(protect, deleteReport);

// AI processing retry endpoint
router.post('/:id/retry', protect, retryProcessing);

export default router;
