import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./db.js";

export async function login(req, res) {
    const { email, password } = req.body;

    const [rows] = await db.query(
        "SELECT id, username, email, password_hash FROM users WHERE email = ?",
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

    // Envia o token e o objeto user que o teu frontend precisa
    res.json({
        token,
        user: {
            email: user.email,
            username: user.username
        }
    });
}

export async function register(req, res) {
    try {
        // 1. Recebe também o username enviado pelo React
        const { username, email, password, birthDate, gender } = req.body;

        if (!email || !password || !birthDate || !gender) {
            return res.status(400).json({ message: "Email e password são obrigatórios." });
        }

        // 2. Cria o hash da password
        const password_hash = await bcrypt.hash(password, 10);

        // 3. Insere na BD (Ajusta as colunas se a tua tabela tiver nomes diferentes!)
        // Se a tua tabela NÃO tiver coluna username, remove o 'username' e o primeiro '?'
        await db.query(
            "INSERT INTO users (username, email, password_hash, birthDate, gender) VALUES (?, ?, ?, ?, ?)",
            [username, email, password_hash, birthDate, gender]
        );

        return res.json({ message: "Utilizador registado com sucesso" });

    } catch (error) {
        // Isto vai fazer o erro real aparecer no terminal do teu VS Code/Node!
        console.error("Erro detalhado no registo:", error);

        return res.status(500).json({
            message: "Erro interno no servidor",
            error: error.message
        });
    }
}