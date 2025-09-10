// src/recaptcha.js
import axios from "axios";
import { CONFIG } from "./config.js";
import { logger } from "./logger.js";
import dotenv from "dotenv";
dotenv.config();


export async function verifyRecaptcha(token, remoteip) {
  if (!token) return { success: false, error: "missing-token" };

const url = process.env.RECAPTCHA_VERIFY_URL;

console.log("ReCAPTCHA verify URL:", url);
  const params = new URLSearchParams();
  params.append("secret", CONFIG.RECAPTCHA_SECRET);
  params.append("response", token);
  if (remoteip) params.append("remoteip", remoteip);

  // try twice if network glitch
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { data } = await axios.post(url, params, { timeout: 5000 });
      // Expected shape: { success, score, action, ... }
      return data;
    } catch (err) {
      logger.warn("reCAPTCHA request failed, attempt " + (attempt + 1), { err: err.message });
      // small backoff on second attempt
      if (attempt === 0) await new Promise((r) => setTimeout(r, 300));
    }
  }
  return { success: false, error: "recaptcha-network-failure" };
}
