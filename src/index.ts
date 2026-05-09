import express, { type Express } from "express";
import dotenv from "dotenv";
import mainRouter from "./routes/app.js";
import cors from "cors";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/api", mainRouter);

export { app };

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server running on http://192.168.1.12:${PORT}`);
});
