const express = require('express');
const router = express.Router();
const { actualizarDolarHoy, obtenerMonedaPorCodigo } = require('../controllers/monedas.controller');

router.post('/actualizar-dolar', actualizarDolarHoy);

//  obtener valor de moneda por código
router.get('/:codigo', obtenerMonedaPorCodigo);

module.exports = router;