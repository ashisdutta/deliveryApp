import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getMyAddresses, addAddress, updateAddress, deleteAddress, } from "../controllers/userController.js";
const router = Router();
// Apply protect middleware to all routes in this file
router.use(protect);
router.get("/addresses", protect, getMyAddresses);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:id", protect, updateAddress);
router.delete("/addresses/:id", protect, deleteAddress);
export default router;
//# sourceMappingURL=userRoutes.js.map