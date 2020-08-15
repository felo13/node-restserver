const jwt = require('jsonwebtoken');

/**
 * Verificar Token
 */
let verificarToken = (req, res, next) => {


    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });

};

/**
 * Verificar Token Imagen
 */
let verificarTokenImg = (req, res, next) => {


    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });

};

/**
 * Verificar Admin Role 
 */
let VerificarAdminRole = (req, res, next) => {

    let role = req.usuario.role;
    if (role != 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no tiene los suficientes privilegios para efectuar esta operación'
            }
        });
    }
    next();

};

module.exports = { verificarToken, VerificarAdminRole, verificarTokenImg };