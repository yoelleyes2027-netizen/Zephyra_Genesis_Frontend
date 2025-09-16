const db = require('../config/db');

const Etiqueta = {
  obtenerTodas: async () => {
    const query = `SELECT * FROM etiquetas`;
    const [rows] = await db.query(query);
    return rows;
  }
};

module.exports = Etiqueta;