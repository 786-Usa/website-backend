import express from "express";
import serverless from "serverless-http";

const app = express();

app.get("/", (req, res) => {
  res.send("Backend running on Vercel!");
});

export default serverless(app);
