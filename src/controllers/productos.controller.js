const Producto = require('../models/productos.model');

// Controlador para obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.obtenerTodosConJoin();
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
};

module.exports = {
  obtenerProductos,
};