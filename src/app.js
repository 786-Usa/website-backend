// src/app.js
import express from "express";
import { logger } from "./logger.js";
import { CONFIG } from "./config.js";
import { globalLimiter } from "./middlewares/rateLimiter.js";
import contactRouter from "./routes/contact.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";
import { startRedisQueueProcessor } from "./queue.js";

const app = express();
app.use(express.json({ limit: "30kb" }));

// security & cors already configured in index.js or you can move here
app.use(globalLimiter);

// mount contact route under /api/contact
app.use("/api/contact", contactRouter);

// health & root
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
app.get("/", (req, res) => res.json({ message: "Contact API" }));

// errors
app.use(notFoundHandler);
app.use(errorHandler);

// start redis queue processor if configured
startRedisQueueProcessor().catch((e) => logger.warn("Queue processor failed to start", { e: e.message }));

export default app;
