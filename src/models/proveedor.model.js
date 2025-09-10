const pool = require('../config/db');

const ProveedorModel = {
  obtenerTodos: async () => {
    const [rows] = await pool.query('SELECT * FROM proveedores');
    return rows;
  }
};

module.exports = ProveedorModel;