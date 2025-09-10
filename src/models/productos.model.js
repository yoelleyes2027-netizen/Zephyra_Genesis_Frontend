const db = require('../config/db');

const Producto = {
  obtenerTodosConJoin: async () => {
    const query = `
      SELECT
        p.id,
        p.codigo,
        p.descripcion,
        p.precio_venta,
        p.precio_compra,
        p.stock,
        p.unidad_medida,
        e.nombre AS etiqueta,
        pr.nombre AS proveedor,
        p.creado_en
      FROM productos p
      LEFT JOIN etiquetas e ON p.etiqueta_id = e.id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
    `;
    
    const [rows] = await db.query(query); // <- esta es la forma correcta con mysql2/promise
    return rows;
  }
};

module.exports = Producto;