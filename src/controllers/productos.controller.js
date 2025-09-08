const ProductosModel = require('../models/productos.model');

async function listarProductos(req, res) {
  try {
    const productos = await ProductosModel.obtenerTodosLosProductos();
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

module.exports = {
  listarProductos
};