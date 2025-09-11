// // src/middlewares/rateLimiter.js
// import rateLimit, { ipKeyGenerator } from "express-rate-limit";
// import RedisStore from "rate-limit-redis";
// import IORedis from "ioredis";
// import { CONFIG } from "../config.js";
// import { logger } from "../logger.js";

// // ✅ Setup Redis client only if REDIS_URL is provided
// let redisClient = null;
// if (CONFIG.REDIS_URL) {
//   redisClient = new IORedis(CONFIG.REDIS_URL, { maxRetriesPerRequest: null });
//   redisClient.on("error", (e) =>
//     logger.warn("Redis error for rate limiter: " + e.message)
//   );
// }

// // ✅ Helper function to generate safe IP key
// const safeKeyGenerator = (req) => {
//   const ip = ipKeyGenerator(req) || "unknown";
//   if (process.env.NODE_ENV !== "production") {
//     console.log("Client IP detected:", ip);
//   }
//   return ip;
// };

// /**
//  * Global rate limiter middleware (light)
//  */
// export const globalLimiter = rateLimit({
//   windowMs: CONFIG.RATE_LIMIT.windowMs,
//   max: CONFIG.RATE_LIMIT.max * 20, // global is looser
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { success: false, message: "Too many requests, try again later." },
//   keyGenerator: safeKeyGenerator,
//   store: redisClient
//     ? new RedisStore({ sendCommand: (...args) => redisClient.call(...args) })
//     : undefined,
// });

// /**
//  * Contact form limiter - stricter (e.g. 5 requests/min per IP)
//  */
// export const contactLimiter = rateLimit({
//   windowMs: parseInt(process.env.CONTACT_LIMIT_WINDOW_MS || "60000", 10),
//   max: parseInt(process.env.CONTACT_LIMIT_MAX || "5", 10),
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Too many contact attempts. Please wait a minute.",
//   },
//   keyGenerator: safeKeyGenerator,
//   store: redisClient
//     ? new RedisStore({ sendCommand: (...args) => redisClient.call(...args) })
//     : undefined,
// });


// src/middlewares/rateLimiter.js
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import IORedis from "ioredis";
import { CONFIG } from "../config.js";
import { logger } from "../logger.js";

// ✅ Serverless-safe Redis client setup
let redisClient = null;

if (CONFIG.REDIS_URL) {
  try {
    // Create singleton Redis client
    if (!global.redisClient) {
      redisClient = new IORedis(CONFIG.REDIS_URL, { maxRetriesPerRequest: null });
      redisClient.on("error", (e) =>
        logger.warn("Redis error for rate limiter: " + e.message)
      );
      global.redisClient = redisClient;
    } else {
      redisClient = global.redisClient;
    }
  } catch (err) {
    logger.warn("Failed to connect Redis, using in-memory store: " + err.message);
    redisClient = null;
  }
} else {
  logger.info("No REDIS_URL provided – using in-memory rate limiting.");
}

// ✅ Safe IP key generator
const safeKeyGenerator = (req) => {
  const ip = ipKeyGenerator(req) || "unknown";
  if (process.env.NODE_ENV !== "production") {
    console.log("Client IP detected:", ip);
  }
  return ip;
};

/**
 * Global rate limiter (looser)
 */
export const globalLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT.windowMs,
  max: CONFIG.RATE_LIMIT.max * 20, // global is looser
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, try again later." },
  keyGenerator: safeKeyGenerator,
  store: redisClient
    ? new RedisStore({ sendCommand: redisClient.call.bind(redisClient) })
    : undefined,
});

/**
 * Contact form limiter (stricter)
 */
export const contactLimiter = rateLimit({
  windowMs: parseInt(process.env.CONTACT_LIMIT_WINDOW_MS || "60000", 10),
  max: parseInt(process.env.CONTACT_LIMIT_MAX || "5", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many contact attempts. Please wait a minute.",
  },
  keyGenerator: safeKeyGenerator,
  store: redisClient
    ? new RedisStore({ sendCommand: redisClient.call.bind(redisClient) })
    : undefined,
});
