const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const { obtenerProductos } = require('../controllers/productos.controller');

// Obtener todos los productos (protegido con JWT)
router.get('/', verificarToken, obtenerProductos);

module.exports = router;