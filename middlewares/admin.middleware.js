const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ error: 'Token não fornecido.' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
        return res.status(401).send({ error: 'Formato do token inválido.' });
    }

    const token = parts[1];

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: 'Token inválido ou expirado.' });
        }

        const allowedRoles = ['admin', 'recepcionista']; 
        
        if (!allowedRoles.includes(decoded.role)) {
            return res.status(403).send({ 
                error: 'Acesso negado. Requer perfil de administrador ou recepcionista.' 
            });
        }

        req.userId = decoded.id; 
        req.userRole = decoded.role;
        return next();
    });
};