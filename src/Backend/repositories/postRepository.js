import prisma from "../config/db.js";

class PostRepository {

  // Criar post
  async create(data) {

    return prisma.post.create({

      data,

      include: {

        user: {

          select: {
            id: true,
            name: true,
            avatar: true
          }
        },

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
      }
    });
  }

  // Buscar feed
  async findAll() {

    return prisma.post.findMany({

      include: {

        user: {

          select: {
            id: true,
            name: true,
            avatar: true
          }
        },

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
          },

          orderBy: {
            createdAt: "desc"
          }
        }
      },

      orderBy: {
        createdAt: "desc"
      }
    });
  }

  // Buscar post por id
  async findById(id) {

    return prisma.post.findUnique({

      where: {
        id
      },

      include: {

        user: {

          select: {
            id: true,
            name: true,
            avatar: true
          }
        },

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
      }
    });
  }

  // Remover post
  async delete(id) {

    return prisma.post.delete({

      where: {
        id
      }
    });
  }

  // Buscar posts do utilizador
  async findByUser(userId) {

    return prisma.post.findMany({

      where: {
        userId
      },

      include: {

        likes: true,

        comments: true
      },

      orderBy: {
        createdAt: "desc"
      }
    });
  }
}

export default new PostRepository();