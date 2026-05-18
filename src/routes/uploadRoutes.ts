import { Router } from "express";
import { getImageKitAuth } from "../controllers/uploadController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// Only logged-in users can generate an upload signature
router.get("/imagekit-auth", protect, getImageKitAuth);

export default router;
