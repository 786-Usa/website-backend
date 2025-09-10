// src/validators.js
import Joi from "joi";

export const contactSchema = Joi.object({
  firstName: Joi.string().trim().min(3).max(100).required(),
  lastName: Joi.string().trim().min(3).max(100).allow("", null),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  phone: Joi.string().trim().allow("", null).max(30).pattern(/^[\d\+\-\s\(\)]*$/),
  contact: Joi.string().valid("phone", "email").optional(),
  subject: Joi.string().trim().max(200).allow("", null),
  message: Joi.string().trim().min(10).max(5000).required(),
  token: Joi.string().required(), // reCAPTCHA token
  address: Joi.any().optional(), // honeypot - should be empty
  formStart: Joi.number().optional() // optional timestamp to detect too-fast submissions
});
