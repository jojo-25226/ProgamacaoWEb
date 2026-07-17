import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getMessages, sendMessage } from "../controllers/messageController.js";

const router = Router();

// Devolve as mensagens
router.get("/:userId", authMiddleware, getMessages);

// Envia uma mensagem
router.post("/", authMiddleware, sendMessage);

export default router;