import { Router } from "express";
import {
  getAllRestaurants,
  getRestaurantById,
  searchMenu,
  getPopularItems,
} from "../controllers/customerController.js";

const router = Router();

router.get("/restaurants", getAllRestaurants);
router.get("/restaurants/:id", getRestaurantById);
router.get("/search", searchMenu);
router.get("/popular-items", getPopularItems);

export default router;
