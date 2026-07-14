import prisma from "../config/db.js";

class LikeRepository {

  // Procurar like
  async findLike(userId, postId) {

    return prisma.like.findFirst({

      where: {
        userId,
        postId
      }
    });
  }

  // Criar like
  async create(data) {

    return prisma.like.create({
      data
    });
  }

  // Remover like
  async delete(id) {

    return prisma.like.delete({

      where: {
        id
      }
    });
  }

  // Contar likes do post
  async count(postId) {

    return prisma.like.count({

      where: {
        postId
      }
    });
  }

  // Verificar se utilizador deu like
  async isLikedByUser(userId, postId) {

    const like =
      await this.findLike(userId, postId);

    return !!like;
  }

  // Toggle like/unlike
  async toggleLike(userId, postId) {

    postId = Number(postId);

    const existingLike =
      await this.findLike(
        userId,
        postId
      );

    // Unlike
    if (existingLike) {

      await this.delete(existingLike.id);

      const likesCount =
        await this.count(postId);

      return {
        liked: false,
        likesCount,
        message: "Like removido"
      };
    }

    // Like
    await this.create({
      userId,
      postId
    });

    const likesCount =
      await this.count(postId);

    return {
      liked: true,
      likesCount,
      message: "Post curtido"
    };
  }
}

export default new LikeRepository();