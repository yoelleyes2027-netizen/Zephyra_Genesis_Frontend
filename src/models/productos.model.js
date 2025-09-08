const db = require('../config/db');

async function obtenerTodosLosProductos() {
  const [rows] = await db.query('SELECT * FROM productos');
  return rows;
}

module.exports = {
  obtenerTodosLosProductos
};