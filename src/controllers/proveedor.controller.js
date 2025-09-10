const ProveedorModel = require('../models/proveedor.model');

const ProveedorController = {
  obtenerProveedores: async (req, res) => {
    try {
      const proveedores = await ProveedorModel.obtenerTodos();
      res.json({ ok: true, data: proveedores });
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      res.status(500).json({ ok: false, msg: 'Error al obtener proveedores' });
    }
  }
};

module.exports = ProveedorController;