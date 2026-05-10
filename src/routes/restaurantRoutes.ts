import { Router } from "express";
import {
  addRestaurant,
  addItem,
  itemList,
  deleteItem,
  toggleRestaurantStatus,
  updateItem,
} from "../controllers/restaurantController.js";
import { getMyRestaurants } from "../controllers/restaurantController.js";

import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = Router();

router.post(
  "/add-restaurant",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  addRestaurant
);
router.post(
  "/add-item",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  addItem
);
router.delete(
  "/delete-item/:id",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  deleteItem
);

router.patch(
  "/:id/toggle-status",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  toggleRestaurantStatus
);

router.patch(
  "/item/:id",
  protect,
  restrictTo("RESTAURANT_OWNER", "SUPER_ADMIN"),
  updateItem
);

router.get("/:id/items", protect, itemList);

router.get(
  "/my-restaurants",
  protect,
  restrictTo("RESTAURANT_OWNER"),
  getMyRestaurants
);

export default router;
