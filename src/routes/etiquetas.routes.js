const express = require('express');
const router = express.Router();
const { obtenerEtiquetas } = require('../controllers/etiquetas.controller');

// Ruta: GET /api/etiquetas
router.get('/', obtenerEtiquetas);

module.exports = router;