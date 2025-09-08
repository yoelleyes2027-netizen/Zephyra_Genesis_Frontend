const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  console.log("Cookies recibidas:", req.cookies); // 👈🏼 esto ayuda mucho

  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ mensaje: 'Token inválido o expirado' });
    }

    req.usuario = usuario;
    next();
  });
}

module.exports = verificarToken;