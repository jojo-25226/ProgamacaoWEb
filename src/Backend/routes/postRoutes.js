import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";
import { createPost, getFeed } from "../controllers/postController.js";
import { toggleLike } from "../controllers/likeController.js";

const router = Router();

router.get("/feed", authMiddleware, getFeed);
router.post("/", authMiddleware, upload.single("image"), createPost);
router.post("/:id/like", authMiddleware, toggleLike);

export default router;