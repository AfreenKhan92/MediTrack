/**
 * Redis-backed Rate Limiter Middleware
 *
 * Protects expensive external-API endpoints (Cloudinary upload + OCR.Space + OpenRouter)
 * from abuse. Uses a fixed window counter stored in Redis.
 *
 * Limits (per authenticated user):
 *   POST /api/reports          → 5 uploads per 15 minutes  (OCR.Space: 500 req/day free tier)
 *   POST /api/reports/:id/retry → 3 retries per 10 minutes
 *
 * Graceful degradation: if Redis is unavailable the middleware fails OPEN —
 * the request is allowed through and a warning is logged. This prevents Redis
 * downtime from blocking legitimate medical-record uploads.
 */

import { cacheIncr, cacheTTL } from '../services/cacheService.js';
import { isRedisAvailable } from '../config/redis.js';

/**
 * Factory — returns an Express middleware function.
 *
 * @param {object} options
 * @param {number} options.max        Max requests allowed within the window
 * @param {number} options.windowSec  Window duration in seconds
 * @param {string} options.label      Slug used in the Redis key (e.g. 'report-upload')
 * @returns {import('express').RequestHandler}
 */
export const rateLimiter = ({ max, windowSec, label }) => {
  return async (req, res, next) => {
    // Fail open when Redis is down — never block legitimate requests
    if (!isRedisAvailable()) {
      console.warn(`[RateLimit] Redis unavailable — skipping rate limit for "${label}"`);
      return next();
    }

    // Identify by authenticated user ID (set by protect middleware), fall back to IP
    const identifier = req.user?._id?.toString() ?? req.ip;
    const key = `ratelimit:${label}:${identifier}`;

    const count = await cacheIncr(key, windowSec);

    if (count === null) {
      // Redis error during INCR — fail open, log and continue
      console.warn(`[RateLimit] cacheIncr returned null for "${key}" — allowing request`);
      return next();
    }

    // Attach informational headers (client-readable, never expose internals)
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));

    if (count > max) {
      const retryAfter = await cacheTTL(key);
      const waitSeconds = retryAfter > 0 ? retryAfter : windowSec;
      res.setHeader('Retry-After', waitSeconds);

      return res.status(429).json({
        message: `Too many requests. Limit is ${max} per ${Math.round(windowSec / 60)} minute(s). Please try again later.`,
        retryAfter: waitSeconds,
      });
    }

    next();
  };
};

export default { rateLimiter };
