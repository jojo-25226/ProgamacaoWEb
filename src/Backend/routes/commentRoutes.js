import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { createComment, getCommentsByPost, toggleCommentLike } from "../controllers/commentController.js";

const router = Router();

// Recebe os comentários de um post
router.get("/:postId", authMiddleware, getCommentsByPost);

// Cria um comentário
router.post("/:postId", authMiddleware, createComment);

// Alterna o like de um comentário
router.post("/:commentId/like", authMiddleware, toggleCommentLike);

export default router;