const express = require('express');
const router = express.Router();
const ProveedorController = require('../controllers/proveedor.controller');
const verificarToken = require('../middlewares/auth.middleware');
const soloAdmin = require('../middlewares/soloAdmin.middleware');

//tomar todos los proveedores
router.get('/', verificarToken, ProveedorController.obtenerProveedores);

//crear proveedor
router.post('/', verificarToken, ProveedorController.crearProveedor);

//buscar proveedor por documento
router.get('/buscar/:documento', verificarToken, ProveedorController.buscarProveedorPorDocumento);

// buscar proveedor por denominación
router.get('/buscar/denominacion/:denominacion', verificarToken, ProveedorController.buscarProveedorPorDenominacion);

// Ruta: PUT /api/proveedores/:documento
router.put('/:documento', verificarToken, soloAdmin, ProveedorController.modificarProveedorPorDocumento);

// Ruta: PUT /api/proveedores/desactivar/:documento
router.put('/desactivar/:documento', verificarToken, soloAdmin, ProveedorController.desactivarProveedor);

module.exports = router;