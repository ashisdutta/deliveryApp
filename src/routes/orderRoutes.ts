import { Router } from "express";
import { restrictTo } from "../middlewares/authMiddleware.js";
import {
  placeOrder,
  orderHistory,
  getOrderDetails,
  cancelOrder,
  getRestaurantOrders,
  updateOrderStatus,
  getDashboardStats,
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

router.get(
  "/restaurant/:restaurantId/dashboard",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  getDashboardStats
);

router.patch("/:id/cancel", protect, cancelOrder);

router.patch(
  "/:id/status",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  updateOrderStatus
);

router.get("/:id", protect, getOrderDetails);
export default router;
