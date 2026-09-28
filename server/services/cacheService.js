/**
 * Cache Service
 * The single point of contact between MediTrack controllers and Redis.
 * Controllers never import the Redis client directly — they use this module.
 *
 * All operations fail silently when Redis is unavailable so that the rest
 * of the application continues to work normally via MongoDB.
 *
 * Key schema:
 *   dashboard:timeline:<userId>   – merged health timeline
 *   family:members:<userId>       – list of all family members for a user
 *   family:member:<memberId>      – single family member document
 *   profile:<userId>              – user profile document
 *   ratelimit:<label>:<identifier>– rate-limit counter (managed by rateLimitMiddleware)
 */

import { getRedisClient, isRedisAvailable } from '../config/redis.js';

// ─── TTL Constants (seconds) ──────────────────────────────────────────────────

export const TTL = {
  /** Merged health timeline — 5 min safety net; also explicitly invalidated on writes */
  TIMELINE: 5 * 60,
  /** Full family member list for a user — 10 minutes */
  FAMILY_LIST: 10 * 60,
  /** Single family member document — 10 minutes */
  FAMILY_MEMBER: 10 * 60,
  /** User profile document — 10 minutes */
  PROFILE: 10 * 60,
};

// ─── Key Builders ─────────────────────────────────────────────────────────────

export const KEYS = {
  timeline:     (userId)   => `dashboard:timeline:${userId}`,
  familyList:   (userId)   => `family:members:${userId}`,
  familyMember: (memberId) => `family:member:${memberId}`,
  profile:      (userId)   => `profile:${userId}`,
};

// ─── Core Cache Operations ────────────────────────────────────────────────────

/**
 * Retrieve a cached value. Returns null on cache miss or Redis unavailability.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export const cacheGet = async (key) => {
  if (!isRedisAvailable()) return null;
  try {
    const raw = await getRedisClient().get(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[CacheService] GET "${key}":`, err.message);
    return null;
  }
};

/**
 * Store a value with an expiry (TTL in seconds).
 * @param {string} key
 * @param {any}    data       – must be JSON-serialisable
 * @param {number} ttlSeconds
 * @returns {Promise<void>}
 */
export const cacheSet = async (key, data, ttlSeconds) => {
  if (!isRedisAvailable()) return;
  try {
    await getRedisClient().setEx(key, ttlSeconds, JSON.stringify(data));
  } catch (err) {
    console.error(`[CacheService] SET "${key}":`, err.message);
  }
};

/**
 * Delete a single cache key (cache invalidation).
 * @param {string} key
 * @returns {Promise<void>}
 */
export const cacheDel = async (key) => {
  if (!isRedisAvailable()) return;
  try {
    await getRedisClient().del(key);
  } catch (err) {
    console.error(`[CacheService] DEL "${key}":`, err.message);
  }
};

/**
 * Delete multiple cache keys in a single command (atomic).
 * Use this when a write invalidates more than one key (e.g. family list + member).
 * @param {string[]} keys
 * @returns {Promise<void>}
 */
export const cacheDelMany = async (keys) => {
  if (!isRedisAvailable() || !keys.length) return;
  try {
    await getRedisClient().del(keys);
  } catch (err) {
    console.error(`[CacheService] DEL (multi) [${keys.join(', ')}]:`, err.message);
  }
};

// ─── Rate-Limit Helpers (used only by rateLimitMiddleware) ────────────────────

/**
 * Increment a counter, setting TTL on first increment.
 * Returns the new count, or null if Redis is unavailable.
 * @param {string} key
 * @param {number} windowSeconds
 * @returns {Promise<number|null>}
 */
export const cacheIncr = async (key, windowSeconds) => {
  if (!isRedisAvailable()) return null;
  try {
    const client = getRedisClient();
    const count = await client.incr(key);
    if (count === 1) {
      // First hit in this window — set the expiry
      await client.expire(key, windowSeconds);
    }
    return count;
  } catch (err) {
    console.error(`[CacheService] INCR "${key}":`, err.message);
    return null;
  }
};

/**
 * Get the remaining TTL for a key (used for the Retry-After header).
 * Returns -1 when key has no TTL or Redis is unavailable.
 * @param {string} key
 * @returns {Promise<number>}
 */
export const cacheTTL = async (key) => {
  if (!isRedisAvailable()) return -1;
  try {
    return await getRedisClient().ttl(key);
  } catch (err) {
    console.error(`[CacheService] TTL "${key}":`, err.message);
    return -1;
  }
};

export default { TTL, KEYS, cacheGet, cacheSet, cacheDel, cacheDelMany, cacheIncr, cacheTTL };
