import { Router } from "express";
import {
    placeOrder,
    orderHistory,
    getOrderDetails,
    cancelOrder
} from "../controllers/orderController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", protect, placeOrder);
router.get("/history", protect, orderHistory);
router.get("/:id", protect, getOrderDetails);
router.patch("/:id/cancel", protect, cancelOrder); 