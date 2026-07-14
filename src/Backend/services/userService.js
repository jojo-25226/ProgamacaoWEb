import userRepository from "../repositories/userRepository.js";

class UserService {

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error("Utilizador não encontrado");
    }

    return {
      ...user,
      avatarUrl: user.avatar
        ? `http://localhost:3000/uploads/${user.avatar}`
        : null,
    };
  }

  async updateAvatar(userId, avatar) {
    const user = await userRepository.updateAvatar(userId, avatar);

    return {
      ...user,
      avatarUrl: `http://localhost:3000/uploads/${user.avatar}`,
    };
  }

  async updateBio(userId, bio) {
    return userRepository.updateBio(userId, bio);
  }

  async getProfile(userId, currentUserId) {
    const user = await userRepository.findProfile(userId);

    if (!user) {
      throw new Error("Utilizador não encontrado");
    }

    const posts = user.posts.map((post) => ({
      ...post,
      imageUrl: post.image
        ? `http://localhost:3000/uploads/${post.image}`
        : null,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      likedByUser: post.likes.some(
        (like) => like.userId === currentUserId
      ),
    }));

    return {
      ...user,
      avatarUrl: user.avatar
        ? `http://localhost:3000/uploads/${user.avatar}`
        : null,
      postsCount: posts.length,
      posts,
    };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error("Utilizador não encontrado");
    }

    return {
      ...user,
      avatarUrl: user.avatar
        ? `http://localhost:3000/uploads/${user.avatar}`
        : null,
    };
  }
}

export default new UserService();