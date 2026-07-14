import { Router } from "express";

import {
  authMiddleware
} from "../middlewares/authMiddleware.js";

import {

  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getReceivedRequests,
  getSentRequests,
  getFriends,
  deleteFriendRequest

} from "../controllers/friendController.js";

const router = Router();

// Enviar pedido
router.post(
  "/request",
  authMiddleware,
  sendFriendRequest
);

// Aceitar pedido
router.patch(
  "/accept/:id",
  authMiddleware,
  acceptFriendRequest
);

// Rejeitar pedido
router.patch(
  "/reject/:id",
  authMiddleware,
  rejectFriendRequest
);

// Pedidos recebidos
router.get(
  "/received",
  authMiddleware,
  getReceivedRequests
);

// Pedidos enviados
router.get(
  "/sent",
  authMiddleware,
  getSentRequests
);

// Lista de amigos
router.get(
  "/list",
  authMiddleware,
  getFriends
);

// Remover pedido/amigo
router.delete(
  "/:id",
  authMiddleware,
  deleteFriendRequest
);

export default router;