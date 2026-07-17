import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";
import { createPost, deletePost, getFeed, toggleLike } from "../controllers/postController.js";

const router = Router();

// Obtem o feed de posts
router.get("/feed", authMiddleware, getFeed);

// Cria um post
router.post("/", authMiddleware, upload.single("image"), createPost);

// Alterna o like de um post
router.post("/:id/like", authMiddleware, toggleLike);

// Apaga um post
router.delete("/:id", authMiddleware, deletePost);

export default router;
