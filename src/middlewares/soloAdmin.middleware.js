function soloAdmin(req, res, next) {
    const usuario = req.usuario;
  
    if (!usuario) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Usuario no autenticado',
      });
    }
  
    if (usuario.rol !== 'admin') {
      return res.status(403).json({
        ok: false,
        mensaje: 'Acceso denegado. Se requiere rol de administrador.',
      });
    }
  
    next();
  }
  
  module.exports = soloAdmin;