import commentRepository from "../repositories/commentRepository.js";

class CommentService {

  async create(userId, postId, data) {
    return commentRepository.create({
      content: data.content,
      userId,
      postId,
    });
  }

  async getComments(postId) {
    return commentRepository.findByPost(postId);
  }
}

export default new CommentService();