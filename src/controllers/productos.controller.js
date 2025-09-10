const Producto = require('../models/productos.model');

// Controlador para obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.obtenerTodosConJoin();

    console.log('Productos obtenidos:', productos);
    
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los productos' });
  }
};

const agregarProducto = async (req, res) => {
  try {
    const nuevoProducto = await Producto.insertar(req.body);
    res.status(201).json({
      ok: true,
      mensaje: 'Producto agregado correctamente',
      producto: nuevoProducto,
    });
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al agregar producto',
    });
  }
};

module.exports = {
  obtenerProductos,
  agregarProducto,
};