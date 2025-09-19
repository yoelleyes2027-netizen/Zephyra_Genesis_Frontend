const express = require('express');
const router = express.Router();
const ProveedorController = require('../controllers/proveedor.controller');
const verificarToken = require('../middlewares/auth.middleware');

//tomar todos los proveedores
router.get('/', verificarToken, ProveedorController.obtenerProveedores);

//crear proveedor
router.post('/', verificarToken, ProveedorController.crearProveedor);

//buscar proveedor por documento
router.get('/buscar/:documento', verificarToken, ProveedorController.buscarProveedorPorDocumento);

module.exports = router;