import { Router } from "express";
import {
    placeOrder,
    orderStatus,
    orderHistory,
    getOrderDetails,
    cancelOrder
} from "../controllers/orderController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", protect, placeOrder);
router.get("/status", protect, orderStatus);
router.get("/history", protect, orderHistory);
router.get("/:id", protect, getOrderDetails);
router.get("/:id/cancel", protect, cancelOrder); 