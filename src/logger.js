// src/logger.js
import winston from "winston";
import { CONFIG } from "./config.js";

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp, meta }) => {
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} ${level}: ${message}${metaStr}`;
});

export const logger = winston.createLogger({
  level: CONFIG.NODE_ENV === "development" ? "debug" : "info",
  format: combine(timestamp(), myFormat),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), myFormat)
    }),
    // Optionally add file transport in production
    // new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

export default logger;