import prisma from "../config/db.js";

class UserRepository {

  async findById(id) {

    return prisma.user.findUnique({

      where: { id },

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

  async updateAvatar(userId, avatar) {

    return prisma.user.update({

      where: {
        id: userId
      },

      data: {
        avatar
      },

      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true
      }
    });
  }

  async updateBio(userId, bio) {

    return prisma.user.update({

      where: {
        id: userId
      },

      data: {
        bio
      },

      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true
      }
    });
  }

  async findProfile(userId) {

    return prisma.user.findUnique({

      where: {
        id: userId
      },

      select: {

        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        createdAt: true,

        posts: {

          include: {

            likes: true,

            comments: {

              include: {

                user: {

                  select: {
                    id: true,
                    name: true,
                    avatar: true
                  }
                }
              }
            }
          },

          orderBy: {
            createdAt: "desc"
          }
        }
      }
    });
  }
}

export default new UserRepository();