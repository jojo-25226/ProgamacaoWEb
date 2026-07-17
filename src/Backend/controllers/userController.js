import {db} from "../config/db.js";

// Devolve o perfil de um utilizador
export async function getUserProfile(req, res) {
    try {
        const userId = Number(req.params.id);

        const [users] = await db.query(`
            SELECT id,
                   username AS name,
                   pfp      AS avatar,
                   bio,
                   profileVisibility
            FROM users
            WHERE id = ?
        `, [userId]);

        if (users.length === 0) {
            return res.status(404).json({message: "Utilizador não encontrado"});
        }

        const profile = users[0];

        // Verifica se o utilizador pode ver o perfil
        const canView = await canViewProfile(
            req.userId,
            userId,
            profile.profileVisibility
        );
        if (!canView) {
            return res.status(403).json({
                message: "Este perfil esta visivel apenas para amigos",
            });
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

// Atualiza a bio de um utilizador
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

// Atualiza a foto de perfil de um utilizador
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

// Atualiza a visibilidade do perfil de um utilizador
export async function updateProfileVisibility(req, res) {
    try {
        const profileVisibility = req.body.profileVisibility;

        if (!["Public", "Friends"].includes(profileVisibility)) {
            return res.status(400).json({
                message: "A visibilidade deve ser Public ou Friends",
            });
        }

        await db.query(
            "UPDATE users SET profileVisibility = ? WHERE id = ?",
            [profileVisibility, req.userId]
        );

        return res.json({profileVisibility});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

// Verifica se um utilizador pode ver o perfil de outro utilizador
async function canViewProfile(viewerId, profileUserId, visibility) {
    // Perfil público
    if (viewerId === profileUserId || visibility === "Public") {
        return true;
    }

    // Só amigos
    const [friendships] = await db.query(`
        SELECT id
        FROM friendRequests
        WHERE status = 'Accepted'
          AND (
            (senderId = ? AND receiverId = ?)
                OR
            (senderId = ? AND receiverId = ?)
            )
            LIMIT 1
    `, [viewerId, profileUserId, profileUserId, viewerId]);

    return friendships.length > 0;
}

// Procura utilizadores pelo nome
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