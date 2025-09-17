const db = require('../config/db');

const Cliente = {
  obtenerTodos: async () => {
    const query = `SELECT * FROM clientes WHERE id != 1 ORDER BY denominacion ASC`;
    const [rows] = await db.query(query);
    return rows;
  }
};

module.exports = Cliente;