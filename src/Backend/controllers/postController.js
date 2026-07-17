import {db} from "../config/db.js";

// Formata os dados MySQL no formato que o frontend espera
function formatPost(row) {
    return {
        id: row.id,
        content: row.content,
        image: row.image,
        imageUrl: row.image
            ? `http://localhost:5000/uploads/${row.image}`
            : null,
        createdAt: row.createdAt,
        author: {
            id: row.userId,
            name: row.username,
            avatar: row.pfp,
        },
        visibility: row.visibility,
        likesCount: Number(row.likesCount ?? 0),
        commentsCount: Number(row.commentsCount ?? 0),
        likedByUser: Boolean(row.likedByUser),
    };
}

// Cria um post
export async function createPost(req, res) {
    try {
        const content = req.body.content?.trim() ?? "";
        const image = req.file?.filename ?? null;
        const visibility =
            req.body.visibility === "Friends" ? "Friends" : "Public";

        if (!content) {
            return res.status(400).json({
                message: "O post tem de conter texto",
            });
        }

        const [result] = await db.query(
            "INSERT INTO posts (content, image, userId, visibility) VALUES (?, ?, ?, ?)",
            [content, image, req.userId, visibility]
        );

        const [rows] = await db.query(`
            SELECT posts.id,
                   posts.content,
                   posts.image,
                   posts.visibility,
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

// Apaga um post
export async function deletePost(req, res) {
    let connection;

    try {
        const postId = Number(req.params.id);

        if (!Number.isInteger(postId)) {
            return res.status(400).json({message: "ID de post invalido"});
        }

        connection = await db.getConnection();
        const [posts] = await connection.query(
            "SELECT userId FROM posts WHERE id = ?",
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({message: "Post nao encontrado"});
        }

        // Só o autor pode apagar o seu próprio post.
        if (posts[0].userId !== req.userId) {
            return res.status(403).json({message: "Sem permissao para apagar este post"});
        }

        await connection.beginTransaction();

        // Remove likes e comentários antes de apagar o post.
        await connection.query("DELETE FROM likes WHERE postId = ?", [postId]);
        await connection.query("DELETE FROM comments WHERE postId = ?", [postId]);
        await connection.query("DELETE FROM posts WHERE id = ?", [postId]);

        await connection.commit();
        return res.json({message: "Post apagado"});
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        return res.status(500).json({message: error.message});
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Lista os posts do feed do utilizador autenticado
export async function getFeed(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT posts.id,
                   posts.content,
                   posts.image,
                   posts.visibility,
                   posts.createdAt,
                   posts.userId,
                   users.username,
                   users.pfp,

                   -- Total de likes
                   (SELECT COUNT(*)
                    FROM likes
                    WHERE likes.postId = posts.id)    AS likesCount,

                   -- Total de comentários
                   (SELECT COUNT(*)
                    FROM comments
                    WHERE comments.postId = posts.id) AS commentsCount,

                   -- Estado do like
                   EXISTS(SELECT 1
                          FROM likes
                          WHERE likes.postId = posts.id
                            AND likes.userId = ?)     AS likedByUser
            FROM posts
            INNER JOIN users ON users.id = posts.userId
            WHERE
               -- Próprios posts
                posts.userId = ?

               -- Posts públicos
               OR posts.visibility = 'Public'

               -- Posts de amigos
               OR (
                posts.visibility = 'Friends'
                    AND EXISTS(SELECT 1
                               FROM friendRequests
                               WHERE status = 'Accepted'
                                 AND (
                                   -- amizade (como receiver)
                                   (senderId = posts.userId AND receiverId = ?)
                                       OR
                                       -- amizade (como sender)
                                   (receiverId = posts.userId AND senderId = ?)
                                   ))
                )
            ORDER BY posts.createdAt DESC
        `, [ req.userId, req.userId, req.userId, req.userId ]);

        return res.json(rows.map(formatPost));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

// Alterna o estado de like do post
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