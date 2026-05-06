import { Router } from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js"; // Assume you have an authorize middleware
import {
  getDeliverySlabs,
  addDeliverySlab,
  updateDeliverySlab,
  deleteDeliverySlab,
} from "../controllers/deliveryPriceController.js";

const router = Router();

router.get("/", protect, getDeliverySlabs);

// ONLY Super Admins can manage the global rate card
router.post("/", protect, restrictTo("SUPER_ADMIN"), addDeliverySlab);
router.put("/:id", protect, restrictTo("SUPER_ADMIN"), updateDeliverySlab);
router.delete("/:id", protect, restrictTo("SUPER_ADMIN"), deleteDeliverySlab);

export default router;
