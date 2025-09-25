const db = require('../config/db');
const normalizarTexto = require('../middlewares/normalizarTexto');

const Etiqueta = {
  obtenerTodas: async () => {
    const query = `SELECT * FROM etiquetas`;
    const [rows] = await db.query(query);
    return rows;
  },

  insertarEtiqueta: async (nombre) => {
    const query = 'INSERT INTO etiquetas (nombre) VALUES (?)';
    await db.query(query, [nombre]);
  },

  etiquetaExiste: async (nombre) => {
    const query = 'SELECT COUNT(*) AS total FROM etiquetas WHERE LOWER(REPLACE(nombre COLLATE utf8mb4_general_ci, "áéíóúÁÉÍÓÚ", "aeiouAEIOU")) = ?';
    const [result] = await db.query(query, [normalizarTexto(nombre)]);
    return result[0].total > 0;
  }
};

module.exports = Etiqueta;

