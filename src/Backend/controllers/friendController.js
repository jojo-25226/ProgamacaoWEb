import {db} from "../config/db.js";

export async function sendFriendRequest(req, res) {
    try {
        const senderId = req.userId;
        const receiverId = Number(req.body.receiverId);

        if (!Number.isInteger(receiverId)) {
            return res.status(400).json({message: "receiverId é obrigatório"});
        }

        if (senderId === receiverId) {
            return res.status(400).json({message: "Não podes adicionar-te a ti próprio"});
        }

        const [users] = await db.query(
            "SELECT id FROM users WHERE id = ?",
            [receiverId]
        );

        if (users.length === 0) {
            return res.status(404).json({message: "Utilizador não encontrado"});
        }

        const [existing] = await db.query(`
            SELECT id, status
            FROM friendRequests
            WHERE (senderId = ? AND receiverId = ?)
               OR (senderId = ? AND receiverId = ?)
        `, [senderId, receiverId, receiverId, senderId]);

        // Um pedido antes rejeitado pode ser enviado novamente.
        if (existing.length > 0 && existing[0].status === "Declined") {
            await db.query("DELETE FROM friendRequests WHERE id = ?", [existing[0].id]);
            existing.length = 0;
        }

        if (existing.length > 0) {
            return res.status(400).json({message: "Já existe um pedido ou amizade"});
        }

        const [result] = await db.query(`
            INSERT INTO friendRequests (senderId, receiverId, status)
            VALUES (?, ?, 'Pending')
        `, [senderId, receiverId]);

        return res.status(201).json({
            id: result.insertId,
            senderId,
            receiverId,
            status: "Pending",
        });
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

async function updateRequestStatus(req, res, status) {
    const id = Number(req.params.id);

    const [result] = await db.query(`
        UPDATE friendRequests
        SET status = ?
        WHERE id = ?
          AND receiverId = ?
          AND status = 'Pending'
    `, [status, id, req.userId]);

    if (result.affectedRows === 0) {
        return res.status(404).json({message: "Pedido não encontrado"});
    }

    return res.json({id, status});
}

export async function acceptFriendRequest(req, res) {
    try {
        return await updateRequestStatus(req, res, "Accepted");
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export async function rejectFriendRequest(req, res) {
    try {
        const id = Number(req.params.id);

        // Rejeitar remove o pedido para permitir um novo convite no futuro.
        const [result] = await db.query(`
            DELETE FROM friendRequests
            WHERE id = ?
              AND receiverId = ?
              AND status = 'Pending'
        `, [id, req.userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({message: "Pedido nao encontrado"});
        }

        return res.json({message: "Pedido rejeitado"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export async function getReceivedRequests(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT fr.id,
                   fr.senderId,
                   fr.receiverId,
                   fr.status,
                   fr.createdAt,
                   users.id       AS senderUserId,
                   users.username AS senderName,
                   users.pfp      AS senderAvatar
            FROM friendRequests fr
                     INNER JOIN users ON users.id = fr.senderId
            WHERE fr.receiverId = ?
              AND fr.status = 'Pending'
        `, [req.userId]);

        return res.json(rows.map((row) => ({
            id: row.id,
            senderId: row.senderId,
            receiverId: row.receiverId,
            status: row.status,
            createdAt: row.createdAt,

            sender: {
                id: row.senderId,
                name: row.senderName,
                avatar: row.senderAvatar,
            },
        })));
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export async function getSentRequests(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT fr.id,
                   fr.senderId,
                   fr.receiverId,
                   fr.status,
                   fr.createdAt,
                   users.id       AS receiverUserId,
                   users.username AS receiverName,
                   users.pfp      AS receiverAvatar
            FROM friendRequests fr
                     INNER JOIN users ON users.id = fr.receiverId
            WHERE fr.senderId = ?
        `, [req.userId]);

        return res.json(rows.map((row) => ({
            id: row.id,
            senderId: row.senderId,
            receiverId: row.receiverId,
            status: row.status,
            createdAt: row.createdAt,
            receiver: {
                id: row.receiverUserId,
                name: row.receiverName,
                avatar: row.receiverAvatar,
            },
        })));
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export async function getFriends(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT fr.id,
                   fr.senderId,
                   fr.receiverId,
                   sender.username   AS senderName,
                   sender.pfp        AS senderAvatar,
                   receiver.username AS receiverName,
                   receiver.pfp      AS receiverAvatar
            FROM friendRequests fr
                     INNER JOIN users sender ON sender.id = fr.senderId
                     INNER JOIN users receiver ON receiver.id = fr.receiverId
            WHERE (fr.senderId = ? OR fr.receiverId = ?)
              AND fr.status = 'Accepted'
        `, [req.userId, req.userId]);

        return res.json(rows.map((row) => ({
            id: row.id,
            senderId: row.senderId,
            receiverId: row.receiverId,
            sender: {
                id: row.senderId,
                name: row.senderName,
                avatar: row.senderAvatar,
            },
            receiver: {
                id: row.receiverId,
                name: row.receiverName,
                avatar: row.receiverAvatar,
            },
        })));
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export async function deleteFriendRequest(req, res) {
    try {
        const id = Number(req.params.id);

        const [result] = await db.query(`
            DELETE FROM friendRequests
            WHERE id = ?
              AND (senderId = ? OR receiverId = ?)
        `, [id, req.userId, req.userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Pedido não encontrado" });
        }

        return res.json({ message: "Pedido removido" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
