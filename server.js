// Build email
// const adminMsg = {
//   to: ADMIN_EMAIL,
//   from: {
//     email: SENDGRID_SENDER,
//     name: "Dark Matter Consulting",
//   },
//   subject: `📥 New Contact: ${sanitize(subject) || "(no subject)"}`,
//   text: `
// Name: ${firstName} ${lastName}
// Email: ${email}
// Phone: ${phone}
// Preferred Contact: ${contact}
// Subject: ${subject}
// Message: ${message}
//   `,
//   html: `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8"/>
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>New Contact Submission</title>
// </head>
// <body style="margin:0; padding:0; background:#f3f4f6; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

//   <!-- Outer Wrapper -->
//   <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#f3f4f6">
//     <tr>
//       <td align="center" style="padding:40px 15px;">

//         <!-- Inner Card -->
//         <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#ffffff"
//                style="max-width:600px; width:100%; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.12);">

//           <!-- Header -->
//           <tr>
//             <td bgcolor="#111827" style="padding:30px; text-align:center;">
//               <h1 style="margin:0; font-size:22px; color:#ffffff; font-weight:600;">Dark Matter Consulting</h1>
//               <p style="margin:8px 0 0; font-size:14px; color:#9ca3af;">📥 New Contact Form Submission</p>
//             </td>
//           </tr>

//           <!-- Body -->
//           <tr>
//             <td style="padding:35px;">

//               <!-- Title -->
//               <h2 style="margin:0 0 25px; font-size:19px; color:#3b82f6; border-bottom:3px solid #3b82f6; padding-bottom:12px; text-align:left;">
//                 Inquiry Details
//               </h2>

//               <!-- Details Table -->
//               <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" 
//                      style="font-size:15px; color:#374151; line-height:1.6;">
//                 <tr>
//                   <td style="padding:10px 0; width:35%; font-weight:600; color:#111827;">Name:</td>
//                   <td>${firstName || ""} ${lastName || ""}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:10px 0; font-weight:600; color:#111827;">Email:</td>
//                   <td><a href="mailto:${email}" style="color:#3b82f6; text-decoration:none;">${email}</a></td>
//                 </tr>
//                 <tr>
//                   <td style="padding:10px 0; font-weight:600; color:#111827;">Phone:</td>
//                   <td>${phone || "N/A"}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:10px 0; font-weight:600; color:#111827;">Preferred Contact:</td>
//                   <td>${contact || "N/A"}</td>
//                 </tr>
//                 <tr>
//                   <td style="padding:10px 0; font-weight:600; color:#111827;">Subject:</td>
//                   <td>${subject || "(no subject)"}</td>
//                 </tr>
//               </table>

//               <!-- Message -->
//               <div style="margin-top:25px; background:#f9fafb; padding:18px; border-left:4px solid #3b82f6; font-size:15px; color:#111827; line-height:1.6; border-radius:6px;">
//                 ${message.replace(/\n/g, "<br/>")}
//               </div>

//             </td>
//           </tr>

//           <!-- Footer -->
//           <tr>
//             <td bgcolor="#f9fafb" style="padding:20px; text-align:center; font-size:12px; color:#6b7280;">
//               <p style="margin:0; font-size:12px;">Reply directly to this email to respond.</p>
//               <p style="margin:6px 0 0; font-size:12px;">IP: ${req.ip} | ${new Date().toLocaleString()}</p>
//             </td>
//           </tr>

//         </table>
//         <!-- End Inner Card -->

//       </td>
//     </tr>
//   </table>
//   <!-- End Outer Wrapper -->

// </body>
// </html>
// `,
//   replyTo: email,
// };

// try {
//   await sgMail.send(msg);
//   res.status(200).json({ message: "Email sent successfully" });
// } catch (error) {
//   console.error("Error sending email:", error);
//   res.status(500).json({ error: "Failed to send email" });
// }











// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import axios from "axios";
// import sgMail from "@sendgrid/mail";
// import rateLimit from "express-rate-limit";
// import helmet from "helmet";

// dotenv.config({ path: "./backend/.env" });


// const PORT = process.env.PORT || 5000;
// const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
// const SENDGRID_SENDER = process.env.SENDGRID_SENDER || ""; // verified sender
// const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ""; // where to send copies
// const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || "";
// const RECAPTCHA_MIN_SCORE = parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.3");
// const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*").split(",");

// // Init SendGrid
// if (!SENDGRID_API_KEY) console.warn("⚠️ Missing SENDGRID_API_KEY");
// sgMail.setApiKey(SENDGRID_API_KEY);

// const app = express();

// // Middleware
// app.use(helmet());
// app.use(express.json({ limit: "20kb" }));
// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin) return cb(null, true); // allow curl, Postman
//       if (ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin)) {
//         return cb(null, true);
//       }
//       return cb(new Error("Not allowed by CORS"));
//     },
//   })
// );
// app.use(
//   rateLimit({
//     windowMs: 60 * 1000, // 1 minute
//     max: 20,
//     message: { success: false, message: "Too many requests. Try again later." },
//   })
// );

// // Small helpers
// const sanitize = (s) => (typeof s === "string" ? s.trim() : "");
// const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// // reCAPTCHA verifier
// async function verifyRecaptcha(token, ip) {
//   if (!RECAPTCHA_SECRET) return { success: false, error: "missing-secret" };

//   try {
//     const params = new URLSearchParams();
//     params.append("secret", RECAPTCHA_SECRET);
//     params.append("response", token);
//     if (ip) params.append("remoteip", ip);

//     const res = await axios.post(
//       "https://www.google.com/recaptcha/api/siteverify",
//       params
//     );
//     return res.data;
//   } catch (err) {
//     console.error("reCAPTCHA error:", err.message);
//     return { success: false, error: "recaptcha-failed" };
//   }
// }

// // 🚀 Contact form endpoint
// app.post("/api/contact", async (req, res) => {
//   try {
//     const {
//       firstName = "",
//       lastName = "",
//       email = "",
//       phone = "",
//       subject = "",
//       message = "",
//       contact = "",
//       token = "",
//     } = req.body;

//     // Validate
//     if (!firstName || !email || !message) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Name, email, and message are required." });
//     }
//     if (!isEmail(email)) {
//       return res.status(400).json({ success: false, message: "Invalid email address." });
//     }
//     if (!token) {
//       return res.status(400).json({ success: false, message: "reCAPTCHA missing." });
//     }

//     console.log("📩 Form submission:", { email, subject, ip: req.ip });

//     // Verify reCAPTCHA
//     const recaptcha = await verifyRecaptcha(token, req.ip);
//     console.log("reCAPTCHA result:", recaptcha);

//     if (!recaptcha.success) {
//       return res.status(400).json({ success: false, message: "reCAPTCHA failed." });
//     }
//     if (typeof recaptcha.score === "number" && recaptcha.score < RECAPTCHA_MIN_SCORE) {
//       return res.status(400).json({ success: false, message: "Suspicious activity detected." });
//     }


// const adminMsg = {
//   to: ADMIN_EMAIL,
//   from: SENDGRID_SENDER,
//   templateId: "d-686d0172dec646db9d4fab8acadd87bf", // Replace with your actual template ID
//   dynamicTemplateData: {
//     firstName: firstName,
//     lastName: lastName,
//     email: email,
//     phone: phone || "Not provided",
//     contactMethod: contact === 'phone' ? 'Phone' : (contact === 'email' ? 'Email' : 'Not specified'),
//     subject: subject || "No subject",
//     message: message.replace(/\n/g, "<br>"),
//     ipAddress: req.ip,
//     date: new Date().toLocaleString(),
//     year: new Date().getFullYear()
//   },
//   replyTo: email
// };

//     // Send email
//     await sgMail.send(adminMsg);
//     console.log("✅ Email sent to admin:", ADMIN_EMAIL);

//     // Optional auto-reply (uncomment if client wants it)
//     /*
//     await sgMail.send({
//       to: email,
//       from: SENDGRID_SENDER,
//       subject: "We received your message",
//       text: `Thanks ${firstName}, we’ll get back to you soon.`,
//       html: `<p>Thanks ${firstName}, we received your message and will be in touch soon.</p>`,
//     });
//     */

//     return res.status(200).json({ success: true, message: "Form submitted successfully." });
//   } catch (err) {
//     console.error("❌ Contact error:", err?.response?.body || err.message);
//     return res.status(500).json({ success: false, message: "Server error. Try again later." });
//   }
// });

// // Health check
// app.get("/api/health", (req, res) => res.json({ status: "ok", time: Date.now() }));

// // Start server
// app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

// server.js (final improved)
// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import axios from "axios";
// import sgMail from "@sendgrid/mail";
// import rateLimit from "express-rate-limit";
// import helmet from "helmet";

// dotenv.config({ path: "./backend/.env" });

// // --- ENV CHECK ---
// const requiredEnvVars = [
//   "SENDGRID_API_KEY",
//   "SENDGRID_SENDER",
//   "ADMIN_EMAIL",
//   "RECAPTCHA_SECRET",
//   "SENDGRID_TEMPLATE_ID"
// ];
// const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
// if (missingEnvVars.length > 0) {
//   console.error(`❌ Missing env vars: ${missingEnvVars.join(", ")}`);
//   process.exit(1);
// }

// // --- CONFIG ---
// const PORT = process.env.PORT || 5000;
// const {
//   SENDGRID_API_KEY,
//   SENDGRID_SENDER,
//   ADMIN_EMAIL,
//   RECAPTCHA_SECRET,
//   SENDGRID_TEMPLATE_ID
// } = process.env;

// const RECAPTCHA_MIN_SCORE = parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5");
// const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
//   ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
//   : ["http://localhost:3000"];

// sgMail.setApiKey(SENDGRID_API_KEY);

// // --- APP INIT ---
// const app = express();
// app.use(helmet({ contentSecurityPolicy: false }));
// app.use(express.json({ limit: "30kb" }));

// // --- CORS ---
// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin) return cb(null, true);
//       if (ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin)) {
//         return cb(null, true);
//       }
//       console.warn(`🚫 Blocked CORS origin: ${origin}`);
//       return cb(new Error("Not allowed by CORS"));
//     },
//     credentials: true
//   })
// );

// // --- RATE LIMIT ---
// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//     message: { success: false, message: "Too many requests. Try later." },
//     standardHeaders: true,
//     legacyHeaders: false
//   })
// );

// // --- HELPERS ---
// const sanitize = s => (typeof s === "string" ? s.trim() : "");
// const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitize(s));
// const isValidPhone = s =>
//   !s || /^[\+]?[1-9][\d]{0,15}$/.test(s.replace(/[\s\-\(\)]/g, ""));

// // Escape HTML
// const escapeHTML = (str = "") =>
//   String(str)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");

// // Preserve spacing & newlines
// function formatMessageForHtml(raw = "") {
//   const escaped = escapeHTML(raw);
//   const withSpaces = escaped.replace(/ {2,}/g, m =>
//     m.split("").map((ch, i) => (i === 0 ? " " : "&nbsp;")).join("")
//   );
//   const withBreaks = withSpaces
//     .replace(/\r\n/g, "\n")
//     .replace(/\r/g, "\n")
//     .replace(/\n/g, "<br>");
//   return withBreaks.replace(/(<br>){9,}/g, "<br><br><br><br><br><br><br><br>");
// }

// // Basic dedupe hash
// const simpleHash = s => {
//   let h = 9;
//   for (let i = 0; i < s.length; i++) {
//     h = Math.imul(h ^ s.charCodeAt(i), 0x5f356495);
//   }
//   return (h >>> 0).toString(36);
// };

// // reCAPTCHA verify
// async function verifyRecaptcha(token, ip) {
//   try {
//     const params = new URLSearchParams();
//     params.append("secret", RECAPTCHA_SECRET);
//     params.append("response", token);
//     if (ip) params.append("remoteip", ip);

//     const { data } = await axios.post(
//       "https://www.google.com/recaptcha/api/siteverify",
//       params,
//       { timeout: 5000 }
//     );
//     return data;
//   } catch (err) {
//     console.error("reCAPTCHA verify error:", err.message);
//     return { success: false };
//   }
// }

// // --- EMAIL SENDER ---
// async function sendContactEmail(formData, ip) {
//   const { firstName, lastName, email, phone, subject, message, contact } =
//     formData;

//   const safeFirst = sanitize(firstName);
//   const safeLast = sanitize(lastName);
//   const safeEmail = sanitize(email);
//   const safePhone = phone ? sanitize(phone) : "Not provided";
//   const safeContact =
//     contact === "phone"
//       ? "Phone"
//       : contact === "email"
//         ? "Email"
//         : "Not specified";
//   const safeSubject = subject ? sanitize(subject) : "No subject";
//   const formattedMessage = formatMessageForHtml(message);

//   const msg = {
//     to: ADMIN_EMAIL,
//     from: SENDGRID_SENDER,
//     subject: `📥 New Contact: ${safeSubject}`, // ✅ fixed header subject
//     templateId: SENDGRID_TEMPLATE_ID,
//     dynamicTemplateData: {
//       firstName: safeFirst,
//       lastName: safeLast,
//       email: safeEmail,
//       phone: safePhone,
//       contactMethod: safeContact,
//       subject: safeSubject,
//       message: formattedMessage,
//       ipAddress: ip,
//       date: new Date().toLocaleString(),
//       year: new Date().getFullYear()
//     },
//     replyTo: isEmail(safeEmail) ? safeEmail : undefined,
//     mailSettings: {
//       sandboxMode: { enable: process.env.NODE_ENV === "test" }
//     }
//   };

//   await sgMail.send(msg);
//   console.log(`✅ Email sent to ${ADMIN_EMAIL} from ${safeEmail || "unknown"}`);
// }

// // --- VALIDATION MIDDLEWARE ---
// function validateContactForm(req, res, next) {
//   const { firstName, email, message, token, phone } = req.body || {};

//   if (!firstName || !email || !message || !token) {
//     return res.status(400).json({
//       success: false,
//       message: "firstName, email, message and captcha token are required."
//     });
//   }
//   if (!isEmail(email)) {
//     return res.status(400).json({ success: false, message: "Invalid email." });
//   }
//   if (phone && !isValidPhone(phone)) {
//     return res.status(400).json({ success: false, message: "Invalid phone." });
//   }

//   const cleanMsg = sanitize(message);
//   if (cleanMsg.length < 10) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Message too short." });
//   }
//   if (cleanMsg.length > 5000) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Message too long." });
//   }

//   next();
// }

// // --- DUPLICATE / ABUSE CHECK ---
// const recentSubmissions = new Map();
// const DUPLICATE_INTERVAL_MS = 30 * 1000;

// // --- API ENDPOINT ---
// app.post("/api/contact", validateContactForm, async (req, res) => {
//   try {
//     const data = req.body;
//     const ip =
//       (req.headers["x-forwarded-for"] || req.ip || "").split(",")[0].trim();

//     if (data.address) {
//       return res.status(400).json({ success: false, message: "Bot detected." });
//     }

//     const hash = simpleHash(
//       `${data.email}|${data.subject || ""}|${data.message?.slice(0, 200)}`
//     );
//     const now = Date.now();
//     const prev = recentSubmissions.get(ip);
//     if (prev && prev.lastHash === hash && now - prev.lastAt < DUPLICATE_INTERVAL_MS) {
//       return res.status(429).json({
//         success: false,
//         message: "Duplicate submission. Please wait a moment."
//       });
//     }
//     recentSubmissions.set(ip, { lastHash: hash, lastAt: now });

//     const recaptcha = await verifyRecaptcha(data.token, ip);
//     if (!recaptcha.success) {
//       return res
//         .status(400)
//         .json({ success: false, message: "reCAPTCHA verification failed." });
//     }
//     if (recaptcha.score && recaptcha.score < RECAPTCHA_MIN_SCORE) {
//       return res.status(400).json({
//         success: false,
//         message: "Suspicious activity detected. Try again."
//       });
//     }

//     if ((String(data.message).match(/https?:\/\/[^\s]+/gi) || []).length > 5) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Too many links in message." });
//     }

//     await sendContactEmail(data, ip);

//     res
//       .status(200)
//       .json({ success: true, message: "Form submitted successfully." });
//   } catch (err) {
//     console.error("Contact handler error:", err.message);
//     res.status(500).json({
//       success: false,
//       message:
//         process.env.NODE_ENV === "production"
//           ? "Server error. Try again later."
//           : err.message
//     });
//   }
// });

// // --- HEALTH & ROOT ---
// app.get("/api/health", (req, res) =>
//   res.json({ status: "ok", time: new Date().toISOString() })
// );
// app.get("/", (req, res) => res.json({ message: "Contact Form API v1" }));

// // --- ERRORS ---
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err);
//   res.status(500).json({ success: false, message: "Internal server error." });
// });
// app.use((req, res) =>
//   res.status(404).json({ success: false, message: "Not found." })
// );

// // --- START ---
// app.listen(PORT, () =>
//   console.log(`🚀 Server running on http://localhost:${PORT}`)
// );

// export default app;



