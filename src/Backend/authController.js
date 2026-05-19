import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./db.js";

export async function login(req, res) {
    const { email, password } = req.body;

    const [rows] = await db.query(
        "SELECT id, email, password_hash FROM users WHERE email = ?",
        [email]
    );

    if (rows.length === 0) {
        return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        "CHAVE_SUPER_SECRETA",
        { expiresIn: "1h" }
    );

    res.json({ token });
}