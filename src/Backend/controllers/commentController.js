import { db } from "../config/db.js";

function formatComment(row) {
  return {
    id: row.id,
    content: row.content,
    postId: row.postId,
    userId: row.userId,
    createdAt: row.createdAt,
    user: {
      id: row.userId,
      name: row.username,
      avatar: row.pfp,
    },
  };
}

// Cria um comentário associado ao post e ao utilizador autenticado
export async function createComment(req, res) {
  try {
    const postId = Number(req.params.postId);
    const content = req.body.content?.trim();

    if (!content) {
      return res.status(400).json({
        message: "O comentário não pode estar vazio",
      });
    }

    const [posts] = await db.query(
        "SELECT id FROM posts WHERE id = ?",
        [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ message: "Post não encontrado" });
    }

    const [result] = await db.query(
        "INSERT INTO comments (content, userId, postId) VALUES (?, ?, ?)",
        [content, req.userId, postId]
    );

    const [rows] = await db.query(`
      SELECT
        comments.id,
        comments.content,
        comments.postId,
        comments.userId,
        comments.createdAt,
        users.username,
        users.pfp
      FROM comments
      INNER JOIN users ON users.id = comments.userId
      WHERE comments.id = ?
    `, [result.insertId]);

    return res.status(201).json(formatComment(rows[0]));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Lista os comentários de um post, do mais recente para o mais antigo
export async function getCommentsByPost(req, res) {
  try {
    const postId = Number(req.params.postId);

    const [rows] = await db.query(`
      SELECT
        comments.id,
        comments.content,
        comments.postId,
        comments.userId,
        comments.createdAt,
        users.username,
        users.pfp
      FROM comments
      INNER JOIN users ON users.id = comments.userId
      WHERE comments.postId = ?
      ORDER BY comments.createdAt DESC
    `, [postId]);

    return res.json(rows.map(formatComment));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}