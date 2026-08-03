import express from 'express';
import { getTimeline } from '../controllers/timelineController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getTimeline);

export default router;
