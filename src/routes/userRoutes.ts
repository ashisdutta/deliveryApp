import { Router } from "express";
import {
    getMe,
    updateUser,
    addAddress
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();


router.get("/me", protect, getMe);
router.put("/update", protect,updateUser);
router.post("/address", protect, addAddress)

export default router;