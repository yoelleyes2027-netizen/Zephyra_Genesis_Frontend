const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const { crearTicket, desactivarTicket } = require('../controllers/ticket.controller');

// Crear un nuevo ticket con sus productos
router.post('/', verificarToken, crearTicket);

// Desactivar ticket
router.put('/desactivar', verificarToken, desactivarTicket);

module.exports = router;