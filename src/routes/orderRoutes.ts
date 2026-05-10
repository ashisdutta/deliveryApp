import { Router } from "express";
import {
  placeOrder,
  orderHistory,
  getOrderDetails,
  cancelOrder,
} from "../controllers/orderController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", protect, placeOrder);
router.get("/history", protect, orderHistory);

router.get(
  "/restaurant/:restaurantId",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  getRestaurantOrders
);

router.get("/:id", protect, getOrderDetails);
router.patch("/:id/cancel", protect, cancelOrder);

router.patch(
  "/:id/status",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  updateOrderStatus
);

export default router;
