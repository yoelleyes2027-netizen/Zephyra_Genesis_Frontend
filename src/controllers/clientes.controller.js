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


module.exports = {
  obtenerClientes,
  crearCliente,
 };