const db = require('../config/db');

const Cliente = {
  obtenerTodos: async () => {
    const query = `SELECT * FROM clientes WHERE id != 1 ORDER BY denominacion ASC`;
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
  }
};

module.exports = Cliente;