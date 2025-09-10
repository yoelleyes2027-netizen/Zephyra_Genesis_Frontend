const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const validarProducto = require('../middlewares/validarProducto.middleware');
const { obtenerProductos, agregarProducto, obtenerProductoPorCodigo } = require('../controllers/productos.controller');

// Obtener todos los productos (protegido con JWT)
router.get('/', verificarToken, obtenerProductos);

// Agregar un nuevo producto
router.post('/', verificarToken, validarProducto, agregarProducto);

// Obtener un producto por código (protegido con JWT)
router.get('/:codigo', verificarToken, obtenerProductoPorCodigo);

module.exports = router;