import prisma from "../config/db.js";

class CommentRepository {

  async create(data) {

    return prisma.comment.create({

      data,

      include: {

        user: {

          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
  }

  async findByPost(postId) {

    return prisma.comment.findMany({

      where: {
        postId
      },

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
    });
  }

  async delete(id) {

    return prisma.comment.delete({
      where: {
        id
      }
    });
  }

  async findById(id) {

    return prisma.comment.findUnique({
      where: {
        id
      }
    });
  }
}

export default new CommentRepository();