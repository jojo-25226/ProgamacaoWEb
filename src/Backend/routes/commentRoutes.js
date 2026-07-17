import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createComment, getCommentsByPost, toggleCommentLike } from "../controllers/commentController.js";

const router = Router();

router.get("/:postId", authMiddleware, getCommentsByPost);
router.post("/:postId", authMiddleware, createComment);
router.post("/:commentId/like", authMiddleware, toggleCommentLike);

export default router;