const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const { crearTicket } = require('../controllers/ticket.controller');

// Crear un nuevo ticket con sus productos
router.post('/', verificarToken, crearTicket);

module.exports = router;