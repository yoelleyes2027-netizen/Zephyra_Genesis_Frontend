const pool = require('../config/db');

const ProveedorModel = {
  obtenerTodos: async () => {
    const [rows] = await pool.query('SELECT * FROM proveedores');
    return rows;
  },

  insertarProveedor: async ({ nombre, telefono, email, direccion, documento, denominacion }) => {
    const query = `
      INSERT INTO proveedores (nombre, telefono, email, direccion, documento, denominacion)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const valores = [nombre, telefono, email, direccion, documento, denominacion];
    await pool.query(query, valores);
  },

  buscarPorDocumento: async (documento) => {
    const query = 'SELECT * FROM proveedores WHERE documento = ? AND activo = 1';
    const [rows] = await pool.query(query, [documento]);
    return rows[0];
  },
};

module.exports = ProveedorModel;