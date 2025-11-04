const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const validarProducto = require('../middlewares/validarProducto.middleware');
const soloAdmin = require('../middlewares/soloAdmin.middleware');
const { obtenerProductos, agregarProducto, obtenerProductoPorCodigo, obtenerProductosPorDescripcion, modificarProductoPorCodigo, eliminarProductoPorCodigo, actualizarStockProductos } = require('../controllers/productos.controller');


// actualizar stockk
router.put('/actualizar-stock', verificarToken, actualizarStockProductos);

// Obtener todos los productos (protegido con JWT)
router.get('/', verificarToken, obtenerProductos);

// Agregar un nuevo producto
router.post('/', verificarToken, validarProducto, agregarProducto);

// Obtener un producto por descripción (protegido con JWT)
router.get('/descripcion/:descripcion', verificarToken, obtenerProductosPorDescripcion);

// Obtener un producto por código (protegido con JWT)
router.get('/:codigo', verificarToken, obtenerProductoPorCodigo);

// Modificar producto por código (solo admin)
router.put('/:codigo', verificarToken, soloAdmin, modificarProductoPorCodigo);

// Eliminar un producto por código (solo admin)
router.delete('/:codigo', verificarToken, soloAdmin, eliminarProductoPorCodigo);

module.exports = router;