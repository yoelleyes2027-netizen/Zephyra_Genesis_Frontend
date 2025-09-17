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

module.exports = { obtenerClientes };