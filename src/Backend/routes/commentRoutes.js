import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createComment,
  getCommentsByPost,
} from "../controllers/commentController.js";

const router = Router();

router.get("/:postId", authMiddleware, getCommentsByPost);
router.post("/:postId", authMiddleware, createComment);

export default router;