const express = require('express');
const router = express.Router();
const ProveedorController = require('../controllers/proveedor.controller');
const verificarToken = require('../middlewares/auth.middleware');

router.get('/', verificarToken, ProveedorController.obtenerProveedores);

module.exports = router;