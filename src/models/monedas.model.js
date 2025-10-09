const db = require('../config/db');

const Moneda = {
  obtenerMonedaPorCodigoDB: async (codigo) => {
    try {
      const [rows] = await db.query(
        'SELECT codigo, nombre, valor_en_pesos, actualizado_en FROM monedas WHERE codigo = ? LIMIT 1',
        [codigo]
      );

      // Si no hay resultados, devolvemos null
      if (rows.length === 0) return null;

      return rows[0];
    } catch (error) {
      console.error('Error en Moneda.obtenerMonedaPorCodigoDB:', error);
      throw error;
    }
  }
};

module.exports = Moneda;