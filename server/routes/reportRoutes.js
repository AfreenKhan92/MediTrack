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
import { rateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Rate limiters for expensive external-API operations
// OCR.Space free tier: 500 req/day — cap at 5 uploads per user per 15 min
const uploadRateLimit = rateLimiter({ max: 5, windowSec: 15 * 60, label: 'report-upload' });
// Retry triggers OCR + OpenRouter — cap at 3 retries per user per 10 min
const retryRateLimit = rateLimiter({ max: 3, windowSec: 10 * 60, label: 'report-retry' });

// Collection routes: list all / upload new
router.route('/')
  .post(protect, uploadRateLimit, upload.single('file'), uploadReport)
  .get(protect, getReports);

// Single report routes: get by ID / delete
router.route('/:id')
  .get(protect, getReportById)
  .delete(protect, deleteReport);

// AI processing retry endpoint
router.post('/:id/retry', protect, retryRateLimit, retryProcessing);

export default router;
