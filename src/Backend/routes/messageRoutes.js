import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
    getMessages,
    sendMessage,
} from "../controllers/messageController.js";

const router = Router();

router.get("/:userId", authMiddleware, getMessages);
router.post("/", authMiddleware, sendMessage);

export default router;