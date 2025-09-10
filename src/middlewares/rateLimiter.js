// src/middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import IORedis from "ioredis";
import { CONFIG } from "../config.js";
import { logger } from "../logger.js";

let redisClient = null;
if (CONFIG.REDIS_URL) {
  redisClient = new IORedis(CONFIG.REDIS_URL, { maxRetriesPerRequest: null });
  redisClient.on("error", (e) => logger.warn("Redis error for rate limiter: " + e.message));
}

/**
 * Global rate limiter middleware (light)
 */
export const globalLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT.windowMs,
  max: CONFIG.RATE_LIMIT.max * 20, // global is larger, contact-specific limiter is stricter
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, try again later." },
  store: redisClient ? new RedisStore({ sendCommand: (...args) => redisClient.call(...args) }) : undefined
});

/**
 * Contact form limiter - stricter
 * Example defaults: 5 requests per minute (IP)
 */
export const contactLimiter = rateLimit({
  windowMs: parseInt(process.env.CONTACT_LIMIT_WINDOW_MS || "60000", 10),
  max: parseInt(process.env.CONTACT_LIMIT_MAX || "5", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many contact attempts. Please wait a minute." },
  store: redisClient ? new RedisStore({ sendCommand: (...args) => redisClient.call(...args) }) : undefined
});
