import { Router } from "express";
import { addRestaurant, addCatagories, addItem, itemList, deleteItem, deleteCatagory, } from "../controllers/restaurantController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = Router();
router.post("/add-restaurant", protect, addRestaurant);
router.post("/add-catagories", protect, addCatagories);
router.post("/add-item", protect, addItem);
router.delete("/delete-item/:id", protect, deleteItem);
router.delete("/delete-catagory/:id", protect, deleteCatagory);
router.get("/:id/items", protect, itemList);
export default router;
//# sourceMappingURL=resturentRoutes.js.map