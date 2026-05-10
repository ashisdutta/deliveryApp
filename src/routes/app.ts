import express from "express";
import authRouter from "./authRoutes.js";
import userRouter from "./userRoutes.js";
import resturentRouter from "./restaurantRoutes.js";
import orderRouter from "./orderRoutes.js";
import deliverySlabRouter from "./deliveryPriceSlabRoutes.js"

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/restaurant", resturentRouter);
router.use("/order", orderRouter);
router.use("/slab", deliverySlabRouter)


export default router;
