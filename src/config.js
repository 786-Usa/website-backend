// src/config.js
import dotenv from "dotenv";
dotenv.config();

const required = [
  "SENDGRID_API_KEY",
  "SENDGRID_SENDER",
  "ADMIN_EMAIL",
  "RECAPTCHA_SECRET",
  "SENDGRID_TEMPLATE_ID"
];

// Collect missing
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn(`⚠️ Warning: missing env vars: ${missing.join(", ")}`);
  // Don't exit in serverless, fallback or throw later inside handler
}

export const CONFIG = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",
  SENDGRID_SENDER: process.env.SENDGRID_SENDER || "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  SENDGRID_TEMPLATE_ID: process.env.SENDGRID_TEMPLATE_ID || "",
  RECAPTCHA_SECRET: process.env.RECAPTCHA_SECRET || "",
  RECAPTCHA_MIN_SCORE: parseFloat(process.env.RECAPTCHA_MIN_SCORE ?? "0.5"),
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
    : ["http://localhost:5173"],
  REDIS_URL: process.env.REDIS_URL || null,
  NODE_ENV: process.env.NODE_ENV || "development",
  RATE_LIMIT: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || `${1 * 60 * 1000}`, 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "5", 10)
  }
};
