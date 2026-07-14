import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getUserProfile } from "../controllers/userController.js";

const router = Router();

router.get("/:id/profile", authMiddleware, getUserProfile);

export default router;