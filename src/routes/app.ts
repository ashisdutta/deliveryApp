import express from "express";
import authRouter from "./authRoutes.js";
import resturentRouter from "./resturentRoutes.js";
import orderRouter from "./orderRoutes.js"

const router = express.Router();

router.use("/auth", authRouter);
router.use("/resturent", resturentRouter);
router.use("/order", orderRouter)


export default router;