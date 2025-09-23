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

const obtenerProductoPorCodigo = async (req, res) => {
  const { codigo } = req.params;
  try {
    const producto = await Producto.obtenerPorCodigo(codigo);

    if (!producto) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Producto no encontrado',
      });
    }

    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto por código:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al obtener el producto',
    });
  }
};

const obtenerProductoPorDescripcion = async (req, res) => {
  const { descripcion } = req.params;
  try {
    const producto = await Producto.obtenerPorDescripcion(descripcion);

    if (!producto) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Producto no encontrado',
      });
    }

    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto por descripción:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al obtener el producto',
    });
  }
};

const modificarProductoPorCodigo = async (req, res) => {
  const { codigo } = req.params;
  const camposActualizados = req.body;

  try {
    const resultado = await Producto.actualizarPorCodigo(codigo, camposActualizados);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Producto no encontrado',
      });
    }

    res.json({
      ok: true,
      mensaje: 'Producto actualizado correctamente',
    });
  } catch (error) {
    console.error('Error al modificar producto:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al modificar producto',
    });
  }
};

const eliminarProductoPorCodigo = async (req, res) => {
  const { codigo } = req.params;

  try {
    const resultado = await Producto.eliminarPorCodigo(codigo);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Producto no encontrado',
      });
    }

    res.json({
      ok: true,
      mensaje: 'Producto eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al eliminar el producto',
    });
  }
};

module.exports = {
  obtenerProductos,
  agregarProducto,
  obtenerProductoPorCodigo,
  obtenerProductoPorDescripcion,
  modificarProductoPorCodigo,
  eliminarProductoPorCodigo,
};