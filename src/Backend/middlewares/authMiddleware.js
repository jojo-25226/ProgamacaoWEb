import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ message: "Token não enviado" });
    }

    const [type, token] = header.split(" ");

    if (type !== "Bearer") {
        return res.status(401).json({ message: "Formato inválido" });
    }

    try {
        const decoded = jwt.verify(token, "CHAVE_SUPER_SECRETA");
        req.user = decoded;
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
}