// src/middlewares/errorHandler.js
import { logger } from "../logger.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: "Endpoint not found." });
}

export function errorHandler(err, req, res, next) {
  logger.error("Unhandled error", { message: err.message, stack: err.stack });
  const status = err.status || 500;
  const safeMessage = status >= 500 ? "Internal server error." : err.message;
  res.status(status).json({ success: false, message: safeMessage });
}
