const express = require('express');
const router = express.Router();
const { actualizarDolarHoy } = require('../controllers/monedas.controller');

router.post('/actualizar-dolar', actualizarDolarHoy);

module.exports = router;