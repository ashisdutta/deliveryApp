import express, {} from "express";
import dotenv from "dotenv";
import mainRouter from "./routes/app.js";
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use("/api", mainRouter);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map