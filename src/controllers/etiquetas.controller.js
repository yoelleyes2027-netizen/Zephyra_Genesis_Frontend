const Etiqueta = require('../models/etiquetas.model');
const normalizarTexto = require('../middlewares/normalizarTexto');

const obtenerEtiquetas = async (req, res) => {
  try {
    const etiquetas = await Etiqueta.obtenerTodas();
    res.status(200).json(etiquetas);
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({ mensaje: 'Error al obtener las etiquetas' });
  }
};

const agregarEtiqueta = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ ok: false, msg: 'El nombre de la etiqueta es obligatorio.' });
    }

    const nombreNormalizado = normalizarTexto(nombre);

    const existe = await Etiqueta.etiquetaExiste(nombreNormalizado);
    if (existe) {
      return res.status(400).json({ ok: false, msg: 'La etiqueta ya existe.' });
    }

    await Etiqueta.insertarEtiqueta(nombre.trim());
    res.status(201).json({ ok: true, msg: 'Etiqueta creada correctamente.' });

  } catch (error) {
    console.error('Error al agregar etiqueta:', error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor.' });
  }
};

module.exports = {
  obtenerEtiquetas,
  agregarEtiqueta,
};