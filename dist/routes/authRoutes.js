import { Router } from "express";
import { updateUser } from "../controllers/userController.js";
import { sendOtp, verifyOtp, logout } from "../controllers/authController.js";
// import { sendOtpLimiter, verifyOtpLimiter } from "../middleware/rateLimiter.js";
// import { getAuthParams } from "../controllers/imageKitController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = Router();
// --- OTP Routes ---
// router.post("/send-otp", sendOtpLimiter, sendOtp);
// --- Auth Routes ---
router.post("/sendOtp", sendOtp);
router.post("/verifyOtp", verifyOtp);
router.post("/logout", logout);
// --- User Routes
router.post("/updateUser", protect, updateUser);
// router.get("/imagekit", getAuthParams);
export default router;
//# sourceMappingURL=authRoutes.js.map