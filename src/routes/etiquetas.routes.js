const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const { obtenerEtiquetas } = require('../controllers/etiquetas.controller');

// Ruta: GET /api/etiquetas
router.get('/', verificarToken, obtenerEtiquetas);

module.exports = router;