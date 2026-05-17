import { Router } from "express";
import {
  getAllRestaurants,
  getRestaurantById,
  searchMenu,
  getPopularItems,
  getCategoryItems,
  getRestaurantMenu
} from "../controllers/customerController.js";

const router = Router();

router.get("/restaurants", getAllRestaurants);
router.get("/restaurants/:id", getRestaurantById);
router.get("/search", searchMenu);
router.get("/popular-items", getPopularItems);

//get item of specific catagory(query)
router.get("/item", getCategoryItems);

router.get("/restaurants/:restaurantId/items", getRestaurantMenu);

export default router;
