import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../config/multer.js";
import { getUserProfile, updateAvatar, updateBio, updateProfileVisibility, searchUsers } from "../controllers/userController.js";

const router = Router();

// Obtem o perfil de um utilizador
router.get("/:id/profile", authMiddleware, getUserProfile);

// Atualiza a bio do utilizador
router.patch("/bio", authMiddleware, updateBio);

// Atualiza o avatar do utilizador
router.patch("/avatar", authMiddleware, upload.single("avatar"), updateAvatar);

// Atualiza a visibilidade do perfil do utilizador
router.patch("/profile-visibility", authMiddleware, updateProfileVisibility);

// Procura utilizadores
router.get("/search", authMiddleware, searchUsers);

export default router;