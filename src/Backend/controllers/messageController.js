import {db} from "../config/db.js";

// Confirma que os dois utilizadores são amigos
async function areFriends(userId, friendId) {
    const [rows] = await db.query(`
        SELECT id
        FROM friendRequests
        WHERE (
            (senderId = ? AND receiverId = ?)
                OR
            (senderId = ? AND receiverId = ?)
            )
          AND status = 'Accepted'
    `, [userId, friendId, friendId, userId]);

    return rows.length > 0;
}

// Devolve o histórico de mensagens entre o utilizador atual e um amigo
export async function getMessages(req, res) {
    try {
        const friendId = Number(req.params.userId);

        if (!Number.isInteger(friendId) || friendId === req.userId) {
            return res.status(400).json({message: "Utilizador inválido"});
        }

        if (!await areFriends(req.userId, friendId)) {
            return res.status(403).json({message: "Só podes conversar com amigos"});
        }

        const [messages] = await db.query(`
            SELECT id, senderId, receiverId, content, createdAt
            FROM messages
            WHERE (senderId = ? AND receiverId = ?)
               OR (senderId = ? AND receiverId = ?)
            ORDER BY createdAt ASC
        `, [req.userId, friendId, friendId, req.userId]);

        return res.json(messages);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

// Envia uma mensagem para o amigo
export async function sendMessage(req, res) {
    try {
        const receiverId = Number(req.body.receiverId);
        const content = req.body.content?.trim();

        if (!Number.isInteger(receiverId) || !content) {
            return res.status(400).json({
                message: "Destinatário e mensagem são obrigatórios",
            });
        }

        if (receiverId === req.userId) {
            return res.status(400).json({
                message: "Não podes enviar mensagem para ti próprio",
            });
        }

        if (!await areFriends(req.userId, receiverId)) {
            return res.status(403).json({message: "Só podes conversar com amigos"});
        }

        const [result] = await db.query(`
            INSERT INTO messages (senderId, receiverId, content)
            VALUES (?, ?, ?)
        `, [req.userId, receiverId, content]);

        const [messages] = await db.query(`
            SELECT id, senderId, receiverId, content, createdAt
            FROM messages
            WHERE id = ?
        `, [result.insertId]);

        return res.status(201).json(messages[0]);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}