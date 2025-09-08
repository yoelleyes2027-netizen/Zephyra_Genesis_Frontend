const express = require('express');
const router = express.Router();

// Importar rutas individuales
const productosRoutes = require('./productos.routes');
const proveedoresRoutes = require('./proveedores.routes');
const clientesRoutes = require('./clientes.routes');
const usuariosRoutes = require('./usuarios.routes');

// Montar rutas bajo /api/...
router.use('/productos', productosRoutes);
router.use('/proveedores', proveedoresRoutes);
router.use('/clientes', clientesRoutes);
router.use('/usuarios', usuariosRoutes);

module.exports = router;