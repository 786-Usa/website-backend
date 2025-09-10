// src/index.js
import dotenv from "dotenv";
dotenv.config();


import app from "./app.js";
import { CONFIG } from "./config.js";
import { logger } from "./logger.js";

const PORT = CONFIG.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server listening on http://localhost:${PORT} (env=${CONFIG.NODE_ENV})`);
});
