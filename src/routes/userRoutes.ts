import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  getMyAddresses,
  getUserProfile,
} from "../controllers/userController.js";

const router = Router();

// Apply protect middleware to all routes in this file
router.use(protect);

router.post("/addresses", protect, addAddress);
router.put("/addresses/:id", protect, updateAddress);
router.delete("/addresses/:id", protect, deleteAddress);

router.get("/me", getUserProfile);
router.get("/addresses", protect, getMyAddresses);

export default router;
