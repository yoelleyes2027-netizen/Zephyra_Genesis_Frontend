const { obtenerDolarHoy } = require('../services/monedas.service');
const db = require('../config/db');

const actualizarDolarHoy = async (req, res) => {
  try {
    const valorUSD = await obtenerDolarHoy();

    if (!valorUSD) {
      return res.status(500).json({ ok: false, msg: 'Error al obtener valor del dólar.' });
    }

    const query = `
      UPDATE monedas
      SET valor_en_pesos = ?
      WHERE codigo = 'USD'
    `;

    await db.query(query, [valorUSD]);

    res.json({ ok: true, msg: 'Valor del dólar actualizado correctamente.', valorUSD });

  } catch (error) {
    console.error('Error al actualizar dólar:', error);
    res.status(500).json({ ok: false, msg: 'Error del servidor al actualizar el dólar.' });
  }
};

module.exports = {
  actualizarDolarHoy
};