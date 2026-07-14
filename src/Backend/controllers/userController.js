import { db } from "../config/db.js";

export async function getUserProfile(req, res) {
  try {
    const userId = Number(req.params.id);

    const [users] = await db.query(`
      SELECT
        id,
        username AS name,
        pfp AS avatar,
        bio
      FROM users
      WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Utilizador não encontrado" });
    }

    const [posts] = await db.query(`
      SELECT
        posts.id,
        posts.content,
        posts.image,
        posts.createdAt,
        posts.userId,
        users.username,
        users.pfp
      FROM posts
      INNER JOIN users ON users.id = posts.userId
      WHERE posts.userId = ?
      ORDER BY posts.createdAt DESC
    `, [userId]);

    const profile = users[0];

    return res.json({
      ...profile,
      postsCount: posts.length,
      posts: posts.map((post) => ({
        ...post,
        imageUrl: post.image
            ? `http://localhost:5000/uploads/${post.image}`
            : null,
        author: {
          id: post.userId,
          name: post.username,
          avatar: post.pfp,
        },
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}