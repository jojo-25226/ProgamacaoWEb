import postRepository from "../repositories/postRepository.js";

class PostService {

  async create(userId, body, file) {
    const { content } = body;
    const image = file ? file.filename : null;

    return postRepository.create({
      content,
      image,
      userId,
    });
  }

  async getFeed(currentUserId) {
    const posts = await postRepository.findAll();

    return posts.map((post) => ({
      ...post,
      author: post.user,
      imageUrl: post.image
        ? `http://localhost:3000/uploads/${post.image}`
        : null,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      likedByUser: post.likes.some(
        (like) => like.userId === currentUserId
      ),
    }));
  }

  async delete(postId, userId) {
    const post = await postRepository.findById(postId);

    if (!post) {
      throw new Error("Post não encontrado");
    }

    if (post.userId !== userId) {
      throw new Error("Sem permissão para deletar este post");
    }

    return postRepository.delete(postId);
  }
}

export default new PostService();