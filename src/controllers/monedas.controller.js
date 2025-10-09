const { obtenerDolarHoy } = require('../services/monedas.service');
const { obtenerMonedaPorCodigoDB } = require('../models/monedas.model');
const db = require('../config/db');

const actualizarDolarHoy = async (req, res) => {
  try {
    const valorUSD = await obtenerDolarHoy();
    if (!valorUSD) {
      return res.status(500).json({ ok: false, msg: 'Error al obtener valor del dólar.' });
    }

    // ✅ Ahora también actualizamos la fecha/hora
    const query = `
      UPDATE monedas
      SET valor_en_pesos = ?, actualizado_en = NOW()
      WHERE codigo = 'USD'
    `;

    await db.query(query, [valorUSD]);

    res.json({
      ok: true,
      msg: 'Valor del dólar actualizado correctamente.',
      valorUSD,
      actualizado_en: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error al actualizar dólar:', error);
    res.status(500).json({ ok: false, msg: 'Error del servidor al actualizar el dólar.' });
  }
};

// obtener valor de una moneda por su código
const obtenerMonedaPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;

    const moneda = await obtenerMonedaPorCodigoDB(codigo);

    if (!moneda) {
      return res.status(404).json({ ok: false, msg: 'Moneda no encontrada.' });
    }

    res.json({
      ok: true,
      codigo: moneda.codigo,
      nombre: moneda.nombre,
      valor_en_pesos: moneda.valor_en_pesos,
      actualizado_en: moneda.actualizado_en
    });
  } catch (error) {
    console.error('Error al obtener moneda:', error);
    res.status(500).json({ ok: false, msg: 'Error del servidor al obtener moneda.' });
  }
};

module.exports = {
  actualizarDolarHoy,
  obtenerMonedaPorCodigo,
};