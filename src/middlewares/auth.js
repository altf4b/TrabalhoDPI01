const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Verifica se a tenticacao existe
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ erro: "Acesso negado. Token não fornecido ou inválido." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Valida e decodifica o token usando a assinatura secreta
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodificado; 
        next(); 
    } catch (erro) {
        return res.status(401).json({ erro: "Token expirado ou inválido." });
    }
};

module.exports = authMiddleware;
