import likeRepository from "../repositories/likeRepository.js";

class LikeService {

  async toggleLike(userId, postId) {
    postId = Number(postId);
    return likeRepository.toggleLike(userId, postId);
  }
}

export default new LikeService();