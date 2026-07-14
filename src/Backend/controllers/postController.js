import {db} from "../config/db.js";

// Formata os dados MySQL no formato que o frontend espera
function formatPost(row, currentUserId) {
    return {
        id: row.id,
        content: row.content,
        image: row.image,
        imageUrl: row.image
            ? `http://localhost:5000/uploads/${row.image}`
            : null,
        createdAt: row.createdAt,
        userId: row.userId,
        author: {
            id: row.userId,
            name: row.username,
            avatar: row.pfp,
        },
        likesCount: 0,
        commentsCount: 0,
        likedByUser: false,
    };
}

export async function createPost(req, res) {
    try {
        const content = req.body.content?.trim() ?? "";
        const image = req.file?.filename ?? null;

        if (!content && !image) {
            return res.status(400).json({
                message: "O post deve ter texto ou imagem",
            });
        }

        const [result] = await db.query(
            "INSERT INTO posts (content, image, userId) VALUES (?, ?, ?)",
            [content, image, req.userId]
        );

        const [rows] = await db.query(`
            SELECT posts.id,
                   posts.content,
                   posts.image,
                   posts.createdAt,
                   posts.userId,
                   users.username,
                   users.pfp
            FROM posts
                     INNER JOIN users ON users.id = posts.userId
            WHERE posts.id = ?
        `, [result.insertId]);

        return res.status(201).json(formatPost(rows[0], req.userId));
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export async function getFeed(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT posts.id,
                   posts.content,
                   posts.image,
                   posts.createdAt,
                   posts.userId,
                   users.username,
                   users.pfp
            FROM posts
                     INNER JOIN users ON users.id = posts.userId
            ORDER BY posts.createdAt DESC
        `);

        return res.json(rows.map((post) => formatPost(post, req.userId)));
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}