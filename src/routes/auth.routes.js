const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro
router.post('/register', async (req, res) => {
  const { nombre, cedula, contraseña, rol } = req.body;

  try {
    // Verificar si el usuario ya existe
    const [userExists] = await pool.query('SELECT * FROM usuarios WHERE cedula = ?', [cedula]);
    if (userExists.length > 0) {
      return res.status(400).json({ ok: false, msg: 'Ya existe un usuario con esa cédula.' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar usuario en la base de datos
    await pool.query(
      'INSERT INTO usuarios (nombre, cedula, contraseña, rol) VALUES (?, ?, ?, ?)',
      [nombre, cedula, hashedPassword, rol]
    );

    res.status(201).json({ ok: true, msg: 'Usuario registrado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { cedula, contraseña } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM usuarios WHERE cedula = ?', [cedula]);
    if (users.length === 0) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado.' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(contraseña, user.contraseña);

    if (!passwordMatch) {
      return res.status(401).json({ ok: false, msg: 'Contraseña incorrecta.' });
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id: user.id,
        cedula: user.cedula,
        rol: user.rol,
        nombre: user.nombre
      },
      process.env.JWT_SECRET || 'secretoSuperSecreto',
      { expiresIn: '7d' }
    );

    res
  .cookie('token', token, {
    httpOnly: true,      // no accesible por JavaScript
    secure: false,       // poner true si estás en HTTPS (en producción)
    sameSite: 'lax',     // proteger contra CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  })
  .json({ ok: true, user: { id: user.id, nombre: user.nombre, rol: user.rol } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor.' });
  }
});

const verificarToken = require('../middlewares/auth.middleware');

// Verificar token (proteger dashboard)
router.get('/verificar-token', verificarToken, (req, res) => {
  res.status(200).json({ ok: true, usuario: req.usuario });
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
});


module.exports = router;