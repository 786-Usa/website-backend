// src/routes/contact.js
import express from "express";
import { logger } from "../logger.js";
import { CONFIG } from "../config.js";
import { contactSchema } from "../validators.js";
import { verifyRecaptcha } from "../recaptcha.js";
import { formatMessageForHtml } from "../utils.js"; // we'll provide utils or inline small fn
import { buildSendGridMessage, sendWithRetries } from "../mailer.js";
import { contactLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// small in-file helpers (to avoid importing many files)
const sanitize = (s) => (typeof s === "string" ? s.trim() : "");
const simpleHash = (s) => {
  let h = 9;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x5f356495);
  }
  return (h >>> 0).toString(36);
};

// per-email throttle (in-memory). In production use Redis
const perEmailCounts = new Map();
const PER_EMAIL_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const PER_EMAIL_MAX = parseInt(process.env.PER_EMAIL_MAX || "10", 10);

router.post("/", contactLimiter, async (req, res) => {
  try {
    const raw = req.body;

    // Joi validation
    const { error, value } = contactSchema.validate(raw, { abortEarly: false, stripUnknown: true });
    if (error) {
      logger.warn("Validation failed", { details: error.details.map((d) => d.message) });
      return res.status(400).json({ success: false, message: "Validation error", details: error.details.map(d => d.message) });
    }

    // Honeypot: 'address' should be empty
    if (value.address) {
      logger.warn("Honeypot triggered", { ip: req.ip });
      return res.status(400).json({ success: false, message: "Bot detected" });
    }

    // Optional timing check if formStart provided (avoid too-fast submissions)
    if (value.formStart) {
      const elapsed = Date.now() - parseInt(value.formStart, 10);
      if (elapsed < 2000) {
        logger.warn("Form submitted too quickly", { elapsed, ip: req.ip });
        return res.status(400).json({ success: false, message: "Form submitted too quickly" });
      }
    }

    // Per-email throttle
    const emailKey = sanitize(value.email).toLowerCase();
    const now = Date.now();
    const prev = perEmailCounts.get(emailKey) || { count: 0, ts: now };
    if (now - prev.ts > PER_EMAIL_WINDOW_MS) {
      perEmailCounts.set(emailKey, { count: 1, ts: now });
    } else {
      if ((prev.count || 0) >= PER_EMAIL_MAX) {
        return res.status(429).json({ success: false, message: "Too many submissions from this email. Try later." });
      }
      perEmailCounts.set(emailKey, { count: (prev.count || 0) + 1, ts: prev.ts });
    }

    // Duplicate detection (first 200 chars)
    const payloadStr = `${value.email}|${value.subject || ""}|${value.message?.slice(0, 200) || ""}`;
    const hash = simpleHash(payloadStr);
    if (!req.app.locals.recentHashes) req.app.locals.recentHashes = new Map();
    const rh = req.app.locals.recentHashes;
    const rhPrev = rh.get(req.ip) || { hash: null, ts: 0 };
    if (rhPrev.hash === hash && Date.now() - rhPrev.ts < 30 * 1000) {
      return res.status(429).json({ success: false, message: "Duplicate submission detected. Wait a bit." });
    }
    rh.set(req.ip, { hash, ts: Date.now() });

    // reCAPTCHA verify
    const recaptchaRes = await verifyRecaptcha(value.token, req.ip);
    if (!recaptchaRes.success) {
      logger.warn("reCAPTCHA failed", { recaptchaRes, ip: req.ip });
      return res.status(400).json({ success: false, message: "reCAPTCHA verification failed" });
    }
    if (typeof recaptchaRes.score === "number" && recaptchaRes.score < CONFIG.RECAPTCHA_MIN_SCORE) {
      logger.warn("Low reCAPTCHA score", { score: recaptchaRes.score, ip: req.ip });
      return res.status(400).json({ success: false, message: "Suspicious activity detected" });
    }

    // Link count heuristic
    const linkCount = (String(value.message).match(/https?:\/\/[^\s]+/gi) || []).length;
    if (linkCount > 5) {
      return res.status(400).json({ success: false, message: "Too many links in message" });
    }

    // Build formatted message & dynamic template data
    // formatMessageForHtml should be implemented in src/utils.js; we also provided earlier in part1 as function
    const { formatMessageForHtml: fmt } = await import("../utils.js");
    const formattedMessage = fmt(value.message);

    const dynamicData = {
      firstName: sanitize(value.firstName),
      lastName: sanitize(value.lastName || ""),
      email: sanitize(value.email),
      phone: sanitize(value.phone || ""),
      contactMethod: value.contact || "Not specified",
      subject: sanitize(value.subject || "No subject"),
      message: formattedMessage,
      ipAddress: req.ip,
      date: new Date().toLocaleString(),
      year: new Date().getFullYear(),
      replyTo: sanitize(value.email)
    };

    const msg = buildSendGridMessage({
      adminEmail: CONFIG.ADMIN_EMAIL,
      fromEmail: CONFIG.SENDGRID_SENDER,
      templateId: CONFIG.SENDGRID_TEMPLATE_ID,
      dynamicData,
      sandbox: process.env.NODE_ENV === "test"
    });

    await sendWithRetries(msg);

    return res.status(200).json({ success: true, message: "Form submitted successfully" });
  } catch (err) {
    logger.error("Contact route error", { err: err.message || err });
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
