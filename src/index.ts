import express from "express";
import dotenv from "dotenv";
import mainRouter from "./routes/app.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 1. Enable Global CORS for local dev testing
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 2. Mount your core routes
app.use("/api", mainRouter);

// 3. Start listening on the local network space
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Server listening globally on network port ${PORT}`);
  console.log(`👉 Double check your Mac's current Wi-Fi IP and update your frontend .env accordingly!`);
});

export { app };