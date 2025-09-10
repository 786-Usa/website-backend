import dotenv from "dotenv";
dotenv.config();

console.log("SENDGRID_API_KEY:", !!process.env.SENDGRID_API_KEY);
console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
