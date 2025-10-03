const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const { crearTicket, desactivarTicket, buscarTicketPorId, eliminarArticulosTicket } = require('../controllers/ticket.controller');

// Crear un nuevo ticket con sus productos
router.post('/', verificarToken, crearTicket);

// Desactivar ticket
router.put('/desactivar', verificarToken, desactivarTicket);

// Buscar ticket activo y sus detalles por ID
router.get('/:ticket_id', verificarToken, buscarTicketPorId);

// Eliminar artículos seleccionados de un ticket
router.post('/eliminar-articulos', verificarToken, eliminarArticulosTicket);

module.exports = router;