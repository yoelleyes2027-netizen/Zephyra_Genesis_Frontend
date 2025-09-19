const { stripVTControlCharacters } = require('node:util');
const Cliente = require('../models/clientes.model');

const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.obtenerTodos();
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ mensaje: 'Error al obtener los clientes' });
  }
};

const crearCliente = async (req, res) => {
  try {
    const nuevoCliente = req.body;

    // Validación básica
    if (!nuevoCliente.nombre || !nuevoCliente.denominacion || !nuevoCliente.numero_doc) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }

    const result = await Cliente.crear(nuevoCliente);
    res.status(201).json({ mensaje: 'Cliente creado correctamente', id: result.insertId });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ mensaje: 'Error al crear cliente' });
  }
};

const buscarClientePorDocumento = async (req, res) => {
  try {
    const { numero_doc } = req.params;

    if (!numero_doc || isNaN(numero_doc)) {
      return res.status(400).json({ mensaje: 'Número de documento inválido' });
    }

    const cliente = await Cliente.buscarPorDocumento(numero_doc);

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.status(200).json(cliente);
  } catch (error) {
    console.error('Error al buscar cliente por documento:', error);
    res.status(500).json({ mensaje: 'Error al buscar el cliente' });
  }
};

const modificarClientePorDocumento = async (req, res) => {
  const { numero_doc } = req.params;
  const camposActualizados = req.body;

  try {
    const resultado = await Cliente.actualizarPorDocumento(numero_doc, camposActualizados);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Cliente no encontrado',
      });
    }

    res.json({
      ok: true,
      mensaje: 'Cliente actualizado correctamente',
    });
  } catch (error) {
    console.error('Error al modificar cliente:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al modificar cliente',
    });
  }
};

const desactivarCliente = async (req, res) => {
  const { documento } = req.params;

  try {
    const resultado = await Cliente.desactivarClientePorDocumento(documento);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Cliente no encontrado o ya estaba inactivo',
      });
    }

    res.json({
      ok: true,
      mensaje: 'Cliente eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al eliminar cliente',
    });
  }
};

module.exports = {
  obtenerClientes,
  crearCliente,
  buscarClientePorDocumento,
  modificarClientePorDocumento,
  desactivarCliente,
 };