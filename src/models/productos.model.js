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
      WHERE p.activo = 1
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
  
  ,
  obtenerPorCodigo: async (codigo) => {
    const query = `
      SELECT
        p.id,
        p.codigo,
        p.descripcion,
        p.precio_venta,
        p.precio_compra,
        p.stock,
        p.unidad_medida,
        p.cod_barra,
        e.nombre AS etiqueta,
        pr.nombre AS proveedor,
        p.creado_en
      FROM productos p
      LEFT JOIN etiquetas e ON p.etiqueta_id = e.id
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.activo = 1 AND p.codigo = ?
      LIMIT 1
    `;
    const [rows] = await db.query(query, [codigo]);
    return rows[0]; // Devuelve solo uno
  },

  actualizarPorCodigo: async (codigo, camposActualizados) => {
    const campos = Object.keys(camposActualizados);
    const valores = Object.values(camposActualizados);
  
    if (campos.length === 0) {
      throw new Error('No se proporcionaron campos para actualizar');
    }
  
    const setClause = campos.map(campo => `${campo} = ?`).join(', ');
    const query = `UPDATE productos SET ${setClause} WHERE codigo = ?`;
  
    valores.push(codigo); // El código va al final para el WHERE
  
    const [result] = await db.query(query, valores);
    return result;
  },

  eliminarPorCodigo: async (codigo) => {
    const query = `UPDATE productos SET activo = 0 WHERE codigo = ?`;
    const [result] = await db.query(query, [codigo]);
    return result;
  },

};

module.exports = Producto;