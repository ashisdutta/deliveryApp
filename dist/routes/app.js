import express from "express";
import authRouter from "./authRoutes.js";
import userRouter from "./userRoutes.js";
import resturentRouter from "./resturentRoutes.js";
import orderRouter from "./orderRoutes.js";
const router = express.Router();
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/resturent", resturentRouter);
router.use("/order", orderRouter);
export default router;
//# sourceMappingURL=app.js.map