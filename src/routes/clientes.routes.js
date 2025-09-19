const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const soloAdmin = require('../middlewares/soloAdmin.middleware');
const ClienteController = require('../controllers/clientes.controller');

// Ruta: GET /api/clientes
router.get('/', verificarToken, ClienteController.obtenerClientes);

// Ruta: POST /api/clientes
router.post('/', verificarToken, ClienteController.crearCliente);

// Ruta: GET /api/clientes/buscar/:numero_doc
router.get('/buscar/:numero_doc', verificarToken, ClienteController.buscarClientePorDocumento);

// Ruta: PUT /api/clientes/:numero_doc
router.put('/:numero_doc', verificarToken, soloAdmin, ClienteController.modificarClientePorDocumento);

// Ruta: PUT /api/clientes/desactivar/:documento
router.put('/desactivar/:documento', verificarToken, soloAdmin, ClienteController.desactivarCliente);

module.exports = router;