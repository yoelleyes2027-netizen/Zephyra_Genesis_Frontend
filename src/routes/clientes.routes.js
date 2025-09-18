const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const ClienteController = require('../controllers/clientes.controller');

// Ruta: GET /api/clientes
router.get('/', verificarToken, ClienteController.obtenerClientes);

// Ruta: POST /api/clientes
router.post('/', verificarToken, ClienteController.crearCliente);

module.exports = router;