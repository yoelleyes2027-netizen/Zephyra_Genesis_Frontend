function validarProducto(req, res, next) {
    const {
      codigo,
      descripcion,
      precio_venta,
      precio_compra,
      unidad_medida,
      etiqueta_id,
      proveedor_id
    } = req.body;
  
    if (
      !codigo || !descripcion || !precio_venta || !precio_compra ||
      !unidad_medida || !etiqueta_id || !proveedor_id
    ) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Todos los campos son obligatorios',
      });
    }
  
    next();
  }
  
  module.exports = validarProducto;