import prisma from "../config/db.js";

class AuthRepository {

  async findUserByEmail(email) {

    return prisma.user.findUnique({

      where: {
        email
      }
    });
  }

  async createUser(data) {

    return prisma.user.create({

      data,

      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true
      }
    });
  }

  async findUserById(id) {

    return prisma.user.findUnique({

      where: {
        id
      },

      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true
      }
    });
  }
}

export default new AuthRepository();