import {db} from "../config/db.js";

export async function getUserProfile(req, res) {
    try {
        const userId = Number(req.params.id);

        const [users] = await db.query(`
            SELECT id,
                   username AS name,
                   pfp      AS avatar,
                   bio
            FROM users
            WHERE id = ?
        `, [userId]);

        if (users.length === 0) {
            return res.status(404).json({message: "Utilizador não encontrado"});
        }

        const [posts] = await db.query(`
            SELECT posts.id,
                   posts.content,
                   posts.image,
                   posts.createdAt,
                   posts.userId,
                   users.username,
                   users.pfp,
                   (SELECT COUNT(*)
                    FROM likes
                    WHERE likes.postId = posts.id)    AS likesCount,

                   (SELECT COUNT(*)
                    FROM comments
                    WHERE comments.postId = posts.id) AS commentsCount,

                   EXISTS(SELECT 1
                          FROM likes
                          WHERE likes.postId = posts.id
                            AND likes.userId = ?)     AS likedByUser
            FROM posts
                     INNER JOIN users ON users.id = posts.userId
            WHERE posts.userId = ?
            ORDER BY posts.createdAt DESC
        `, [req.userId, userId]);

        const profile = users[0];

        return res.json({
            ...profile,
            postsCount: posts.length,
            posts: posts.map((post) => ({
                ...post,
                imageUrl: post.image
                    ? `http://localhost:5000/uploads/${post.image}`
                    : null,
                likesCount: Number(post.likesCount ?? 0),
                commentsCount: Number(post.commentsCount ?? 0),
                likedByUser: Boolean(post.likedByUser),
                author: {
                    id: post.userId,
                    name: post.username,
                    avatar: post.pfp,
                },
            })),
        });
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export async function updateBio(req, res) {
    try {
        const bio = req.body.bio?.trim();

        if (!bio) {
            return res.status(400).json({message: "A bio não pode estar vazia"});
        }

        await db.query(
            "UPDATE users SET bio = ? WHERE id = ?",
            [bio, req.userId]
        );

        return res.json({bio});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export async function updateAvatar(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({message: "Nenhuma imagem enviada"});
        }

        await db.query(
            "UPDATE users SET pfp = ? WHERE id = ?",
            [req.file.filename, req.userId]
        );

        return res.json({avatar: req.file.filename});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export async function searchUsers(req, res) {
    try {
        const query = req.query.q?.trim() ?? "";

        if (!query) {
            return res.json([]);
        }

        const [users] = await db.query(`
            SELECT id,
                   username AS name,
                   pfp      AS avatar
            FROM users
            WHERE username LIKE ?
              AND id != ?
      LIMIT 10
        `, [`%${query}%`, req.userId]);

        return res.json(users);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}