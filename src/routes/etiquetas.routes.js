const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const { obtenerEtiquetas, agregarEtiqueta } = require('../controllers/etiquetas.controller');

// Ruta: GET /api/etiquetas (consultar etiquetas)
router.get('/', verificarToken, obtenerEtiquetas);

//agregar etiquetas
router.post('/agregar', verificarToken, agregarEtiqueta);

module.exports = router;