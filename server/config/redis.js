/**
 * Redis Client Configuration
 * Uses the official 'redis' npm package (v4+).
 *
 * TLS is automatically enabled when REDIS_URL starts with 'rediss://' (Upstash, etc.).
 *
 * Graceful degradation: Redis unavailability does NOT crash the application.
 * All cache features simply become no-ops; MongoDB continues serving as the source of truth.
 */

import { createClient } from 'redis';

let redisClient = null;
let isRedisConnected = false;

/**
 * Initialise and connect the Redis client.
 * Called once from server.js at startup — after connectDB().
 */
export const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('[Redis] REDIS_URL is not set — caching and rate limiting disabled.');
    return;
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        // Enable TLS for rediss:// URLs (Upstash always requires TLS)
        tls: redisUrl.startsWith('rediss://'),
        // Exponential back-off: 500ms, 1s, 1.5s … max 3s — stop after 5 attempts
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.error('[Redis] Max reconnection attempts (5) reached. Disabling Redis features.');
            isRedisConnected = false;
            return false; // stops the reconnect loop
          }
          const delayMs = Math.min(retries * 500, 3000);
          console.warn(`[Redis] Reconnecting in ${delayMs}ms (attempt ${retries + 1} / 5)…`);
          return delayMs;
        },
      },
    });

    redisClient.on('ready', () => {
      console.log('[Redis] Connected and ready');
      isRedisConnected = true;
    });

    redisClient.on('error', (err) => {
      // Log but do NOT throw — caching silently degrades
      console.error('[Redis] Client error:', err.message);
      isRedisConnected = false;
    });

    redisClient.on('reconnecting', () => {
      isRedisConnected = false;
    });

    redisClient.on('end', () => {
      console.warn('[Redis] Connection closed');
      isRedisConnected = false;
    });

    await redisClient.connect();
  } catch (err) {
    console.error('[Redis] Initial connection failed:', err.message);
    console.warn('[Redis] Continuing without Redis — caching and rate limiting disabled.');
    redisClient = null;
    isRedisConnected = false;
  }
};

/**
 * Gracefully close the Redis connection.
 * Called from the SIGTERM / SIGINT handler in server.js.
 */
export const disconnectRedis = async () => {
  if (redisClient && isRedisConnected) {
    try {
      await redisClient.quit();
      console.log('[Redis] Connection closed gracefully');
    } catch (err) {
      console.error('[Redis] Error during graceful disconnect:', err.message);
    }
  }
};

/** Returns the raw Redis client instance (use via cacheService, not directly). */
export const getRedisClient = () => redisClient;

/** True only when the client is connected and ready to accept commands. */
export const isRedisAvailable = () => isRedisConnected && redisClient !== null;
