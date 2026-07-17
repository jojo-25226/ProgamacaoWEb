import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";
import { getUserProfile, updateAvatar, updateBio, updateProfileVisibility, searchUsers } from "../controllers/userController.js";

const router = Router();

router.patch("/bio", authMiddleware, updateBio);
router.patch("/avatar", authMiddleware, upload.single("avatar"), updateAvatar);
router.get("/search", authMiddleware, searchUsers);
router.get("/:id/profile", authMiddleware, getUserProfile);
router.patch("/profile-visibility", authMiddleware, updateProfileVisibility);

export default router;