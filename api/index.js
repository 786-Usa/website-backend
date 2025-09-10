// api/index.js
import serverless from "serverless-http";
import app from "../src/app.js";

// Wrap the existing app from src/app.js
export default serverless(app);
