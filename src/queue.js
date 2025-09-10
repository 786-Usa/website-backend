// src/queue.js
import { CONFIG } from "./config.js";
import { logger } from "./logger.js";
import IORedis from "ioredis";

let redis = null;
let useRedis = false;
if (CONFIG.REDIS_URL) {
  try {
    redis = new IORedis(CONFIG.REDIS_URL, { maxRetriesPerRequest: null });
    useRedis = true;
    redis.on("error", (e) => logger.warn("Redis queue error", { e: e.message }));
  } catch (err) {
    logger.warn("Redis init failed, falling back to in-memory queue", { err: err.message });
    useRedis = false;
    redis = null;
  }
}

// Simple in-memory queue fallback
const memQueue = [];
let memProcessing = false;

export const pushToQueue = async (jobName, payload) => {
  if (useRedis && redis) {
    // keep a tiny redis-backed queue via RPUSH/LPOP
    const key = `queue:${jobName}`;
    await redis.rpush(key, JSON.stringify(payload));
    logger.debug(`Queued job ${jobName} -> redis`);
    return true;
  } else {
    memQueue.push({ jobName, payload });
    logger.debug(`Queued job ${jobName} -> mem (len=${memQueue.length})`);
    processMemQueue().catch((e) => logger.warn("memQueue proc err", { e: e.message }));
    return true;
  }
};

async function processMemQueue() {
  if (memProcessing) return;
  memProcessing = true;
  while (memQueue.length) {
    const item = memQueue.shift();
    try {
      // require mailer lazily to avoid circular deps
      const { processQueuedJob } = await import("./mailer.js");
      await processQueuedJob(item.jobName, item.payload);
    } catch (err) {
      logger.error("memQueue job failed", { err: err.message });
      // if failure, re-queue with backoff
      memQueue.unshift(item);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  memProcessing = false;
}

// Redis consumer loop (simple)
export const startRedisQueueProcessor = async () => {
  if (!useRedis || !redis) return;
  logger.info("Starting Redis queue processor (simple LPOP loop)");
  const keysPrefix = "queue:";
  // simple LPOP consumer per queue name
  const loop = async () => {
    try {
      const keys = await redis.keys(`${keysPrefix}*`);
      for (const k of keys) {
        const raw = await redis.lpop(k);
        if (!raw) continue;
        const payload = JSON.parse(raw);
        try {
          const { processQueuedJob } = await import("./mailer.js");
          await processQueuedJob(k.replace(keysPrefix, ""), payload);
        } catch (err) {
          logger.error("Redis queued job failed, requeueing", { err: err.message });
          // push back to tail with small delay
          await redis.rpush(k, raw);
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    } catch (err) {
      logger.warn("Redis queue processor loop error", { err: err.message });
    } finally {
      setTimeout(loop, 500); // throttle loop
    }
  };
  loop();
};
