import { db } from "../config/db.js";

export async function toggleLike(req, res) {
  try {
    const userId = req.userId;
    const postId = Number(req.params.id);

    if (!Number.isInteger(postId)) {
      return res.status(400).json({ message: "ID de post inválido" });
    }

    const [posts] = await db.query(
        "SELECT id FROM posts WHERE id = ?",
        [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ message: "Post não encontrado" });
    }

    const [existingLikes] = await db.query(
        "SELECT id FROM likes WHERE userId = ? AND postId = ?",
        [userId, postId]
    );

    let liked;

    if (existingLikes.length > 0) {
      await db.query(
          "DELETE FROM likes WHERE userId = ? AND postId = ?",
          [userId, postId]
      );
      liked = false;
    } else {
      await db.query(
          "INSERT INTO likes (userId, postId) VALUES (?, ?)",
          [userId, postId]
      );
      liked = true;
    }

    const [countRows] = await db.query(
        "SELECT COUNT(*) AS likesCount FROM likes WHERE postId = ?",
        [postId]
    );

    return res.json({
      liked,
      likesCount: countRows[0].likesCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}