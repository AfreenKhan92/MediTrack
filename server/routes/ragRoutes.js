import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimiter } from '../middleware/rateLimitMiddleware.js';
import { askRagQuestion } from '../controllers/ragController.js';

const router = express.Router();
const ragAskRateLimit = rateLimiter({
  max: 10,
  windowSec: 15 * 60,
  label: 'rag-ask',
});

router.post('/ask', protect, ragAskRateLimit, askRagQuestion);

export default router;
