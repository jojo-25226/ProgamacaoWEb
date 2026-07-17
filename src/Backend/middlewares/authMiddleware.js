import jwt from "jsonwebtoken";

// Confirma se o pedido foi feito por um utilizador autenticado.
export function authMiddleware(req, res, next) {
    // O frontend envia o token no header Authorization
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ message: "Token não enviado" });
    }

    const [type, token] = header.split(" ");

    if (type !== "Bearer") {
        return res.status(401).json({ message: "Formato inválido" });
    }

    try {
        // Verifica se o token foi criado pelo servidor e ainda é válido.
        const decoded = jwt.verify(token, "CHAVE_SUPER_SECRETA");

        // Guarda os dados do utilizador no pedido para os controllers usarem.
        req.user = decoded;
        req.userId = decoded.userId;

        // O utilizador está autenticado: continua para a rota/controller.
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Token inválido ou expirado",
        });
    }
}