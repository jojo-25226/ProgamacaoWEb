import prisma from "../config/db.js";

// Enviar pedido de amizade
export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.body;

    // Validar receiverId
    if (!receiverId) {
      return res.status(400).json({
        message: "receiverId é obrigatório"
      });
    }

    // Não pode adicionar a si mesmo
    if (senderId === receiverId) {
      return res.status(400).json({
        message: "Você não pode adicionar você mesmo"
      });
    }

    // Verificar se utilizador existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({
        message: "Utilizador não encontrado"
      });
    }

    // Verificar se já existe pedido
    const existingRequest =
      await prisma.friendRequest.findFirst({
        where: {
          senderId,
          receiverId
        }
      });

    if (existingRequest) {
      return res.status(400).json({
        message: "Pedido já enviado"
      });
    }

    // Criar pedido
    const request =
      await prisma.friendRequest.create({
        data: {
          senderId,
          receiverId
        }
      });

    res.status(201).json(request);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Aceitar pedido
export const acceptFriendRequest = async (req, res) => {
  try {
    const requestId = Number(req.params.id);

    const request =
      await prisma.friendRequest.update({
        where: {
          id: requestId
        },
        data: {
          status: "ACCEPTED"
        }
      });

    res.json(request);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Rejeitar pedido
export const rejectFriendRequest = async (req, res) => {
  try {
    const requestId = Number(req.params.id);

    const request =
      await prisma.friendRequest.update({
        where: {
          id: requestId
        },
        data: {
          status: "REJECTED"
        }
      });

    res.json(request);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Buscar pedidos recebidos
export const getReceivedRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests =
      await prisma.friendRequest.findMany({
        where: {
          receiverId: userId,
          status: "PENDING"
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

    res.json(requests);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Buscar pedidos enviados
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests =
      await prisma.friendRequest.findMany({
        where: {
          senderId: userId
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });

    res.json(requests);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Buscar amigos aceites
export const getFriends = async (req, res) => {
  try {
    const userId = req.userId;

    const friends =
      await prisma.friendRequest.findMany({
        where: {
          OR: [
            {
              senderId: userId,
              status: "ACCEPTED"
            },
            {
              receiverId: userId,
              status: "ACCEPTED"
            }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      });

    res.json(friends);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Cancelar/remover pedido
export const deleteFriendRequest = async (req, res) => {
  try {
    const requestId = Number(req.params.id);

    await prisma.friendRequest.delete({
      where: {
        id: requestId
      }
    });

    res.json({
      message: "Pedido removido"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};