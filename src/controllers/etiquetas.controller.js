const Etiqueta = require('../models/etiquetas.model');

const obtenerEtiquetas = async (req, res) => {
  try {
    const etiquetas = await Etiqueta.obtenerTodas();
    res.status(200).json(etiquetas);
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({ mensaje: 'Error al obtener las etiquetas' });
  }
};

module.exports = { obtenerEtiquetas };