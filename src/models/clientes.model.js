const db = require('../config/db');

const Cliente = {
  obtenerTodos: async () => {
    const query = `SELECT * FROM clientes c WHERE id != 1 AND c.activo = 1 ORDER BY denominacion ASC`;
    const [rows] = await db.query(query);
    return rows;
  },

  crear: async ({ nombre, telefono, email, direccion, tipo_documento, codigo_pais, denominacion, numero_doc }) => {
    const query = `
      INSERT INTO clientes 
      (nombre, telefono, email, direccion, tipo_documento, codigo_pais, denominacion, numero_doc) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [nombre, telefono, email, direccion, tipo_documento, codigo_pais, denominacion, numero_doc]);
    return result;
  },

  buscarPorDocumento: async (numero_doc) => {
    const query = 'SELECT * FROM clientes  c WHERE numero_doc = ? AND c.activo = 1 LIMIT 1';
    const [rows] = await db.query(query, [numero_doc]);
    return rows[0] || null;
  },

  actualizarPorDocumento: async (numero_doc, camposActualizados) => {
    const campos = Object.keys(camposActualizados);
    const valores = Object.values(camposActualizados);
  
    if (campos.length === 0) {
      throw new Error('No se proporcionaron campos para actualizar');
    }
  
    const setClause = campos.map(campo => `${campo} = ?`).join(', ');
    const query = `UPDATE clientes SET ${setClause} WHERE numero_doc = ?`;
  
    valores.push(numero_doc); // El documento va al final para el WHERE
  
    const [result] = await db.query(query, valores);
    return result;
  },

  desactivarClientePorDocumento: async (documento) => {
    const query = 'UPDATE clientes SET activo = 0 WHERE numero_doc = ?';
    const [result] = await db.query(query, [documento]);
    return result;
  }
};

module.exports = Cliente;