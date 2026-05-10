import { Router } from "express";
import {
  addRestaurant,
  //addCatagories,
  addItem,
  itemList,
  deleteItem,
  //deleteCatagory,
} from "../controllers/restaurantController.js";
import { getMyRestaurants } from "../controllers/restaurantController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/add-restaurant", protect, addRestaurant);
router.post("/add-item", protect, addItem);
router.delete("/delete-item/:id", protect, deleteItem);

router.get("/:id/items", protect, itemList);

router.get(
  "/my-restaurants",
  protect,
  restrictTo("RESTAURANT_OWNER"),
  getMyRestaurants
);

export default router;
