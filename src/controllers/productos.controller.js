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

const obtenerProductosPorDescripcion = async (req, res) => {
  const { descripcion } = req.params;
  try {
    const productos = await Producto.buscarMuchosPorDescripcion(descripcion);

    if (!productos || productos.length === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No se encontraron productos con esa descripción',
      });
    }

    res.json({
      ok: true,
      total: productos.length,
      data: productos,      // ← devolvemos la lista completa
    });
  } catch (error) {
    console.error('Error al obtener productos por descripción:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno al obtener los productos',
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

const actualizarStockProductos = async (req, res) => {
  try {
    const { productos, operacion = 'venta' } = req.body;

    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Debe enviar un array de productos con cantidades.'
      });
    }

    if (!['venta', 'devolucion'].includes(operacion)) {
      return res.status(400).json({
        ok: false,
        mensaje: "La operación debe ser 'venta' o 'devolucion'."
      });
    }

    // (validación liviana de cantidades)
    for (const it of productos) {
      if (!it?.producto_id || !Number.isFinite(+it.cantidad) || +it.cantidad <= 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Cada item debe incluir producto_id y cantidad > 0.'
        });
      }
    }

    const resultado = await Producto.actualizarStockMultiple(productos, operacion);

    res.json({
      ok: true,
      mensaje: 'Stock actualizado correctamente.',
      resultado
    });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al actualizar el stock de productos.'
    });
  }
};

module.exports = {
  obtenerProductos,
  agregarProducto,
  obtenerProductoPorCodigo,
  obtenerProductosPorDescripcion,
  modificarProductoPorCodigo,
  eliminarProductoPorCodigo,
  actualizarStockProductos,
};