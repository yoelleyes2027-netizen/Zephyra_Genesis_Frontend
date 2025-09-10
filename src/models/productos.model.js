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
  ,
  insertar: async (data) => {
    const {
      codigo,
      descripcion,
      precio_venta,
      precio_compra,
      unidad_medida,
      etiqueta_id,
      proveedor_id
    } = data;
  
    const query = `
      INSERT INTO productos
      (codigo, descripcion, precio_venta, precio_compra, unidad_medida, etiqueta_id, proveedor_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
  
    const [result] = await db.query(query, [
      codigo,
      descripcion,
      precio_venta,
      precio_compra,
      unidad_medida,
      etiqueta_id,
      proveedor_id
    ]);
  
    return { id: result.insertId, ...data };
  }

};

module.exports = Producto;