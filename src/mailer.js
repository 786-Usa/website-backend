// src/mailer.js
import sgMail from "@sendgrid/mail";
import { CONFIG } from "./config.js";
import { logger } from "./logger.js";
import { pushToQueue } from "./queue.js";

sgMail.setApiKey(CONFIG.SENDGRID_API_KEY);

/**
 * sendWithRetries: attempt to send via SendGrid with retries + exponential backoff.
 * If all attempts fail, will push to queue fallback.
 */
export async function sendWithRetries(msg, opts = {}) {
  const maxAttempts = opts.maxAttempts || 3;
  let attempt = 0;
  let lastErr = null;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      logger.debug("SendGrid attempt", { attempt, to: msg.to, subject: msg.subject });
      await sgMail.send(msg);
      logger.info("SendGrid send success", { to: msg.to, subject: msg.subject });
      return true;
    } catch (err) {
      lastErr = err;
      logger.warn("SendGrid send failed", { attempt, err: err.message || err });
      const backoffMs = 200 * Math.pow(2, attempt); // 200, 400, 800ms
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }

  // If reached here, all attempts failed -> enqueue fallback
  try {
    await pushToQueue("send-email", msg);
    logger.warn("SendGrid failed, pushed to queue for retry later", { to: msg.to });
    return true;
  } catch (qerr) {
    logger.error("Failed to push to queue fallback", { err: qerr.message });
    throw lastErr || qerr;
  }
}

/**
 * processQueuedJob: handle queued jobs (called by queue processors)
 * jobName: 'send-email' expected
 */
export async function processQueuedJob(jobName, payload) {
  if (jobName !== "send-email" && jobName !== "queue:send-email") {
    logger.warn("Unknown queued job", { jobName });
    return;
  }
  try {
    logger.info("Processing queued send-email job", { to: payload.to });
    await sgMail.send(payload);
    logger.info("Queued send-email succeeded", { to: payload.to });
  } catch (err) {
    logger.error("Queued send-email failed", { err: err.message });
    throw err;
  }
}

/**
 * buildSendGridMessage: build msg object for SendGrid.
 * - Use sanitized header subject (safeSubject)
 * - dynamicTemplateData must include subject and message (message is html-safe)
 */
export function buildSendGridMessage({ adminEmail, fromEmail, templateId, dynamicData, sandbox = false }) {
  const msg = {
    to: adminEmail,
    from: fromEmail,
    subject: `📥 New Contact: ${dynamicData.subject || "(no subject)"}`,
    templateId,
    dynamicTemplateData: dynamicData,
    mailSettings: {
      sandboxMode: { enable: sandbox }
    }
  };
  if (dynamicData.replyTo && dynamicData.replyTo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    msg.replyTo = dynamicData.replyTo;
  }
  return msg;
}
