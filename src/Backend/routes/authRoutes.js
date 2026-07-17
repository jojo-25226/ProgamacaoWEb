import { Router } from "express";
import { login, register } from "../controllers/authController.js";

const router = Router();

// Login
router.post("/login", login);

// Registo
router.post("/register", register);

export default router;