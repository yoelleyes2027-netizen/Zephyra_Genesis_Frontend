const ProveedorModel = require('../models/proveedor.model');

const obtenerProveedores = async (req, res) => {
  try {
    const proveedores = await ProveedorModel.obtenerTodos();
    res.json({ ok: true, data: proveedores });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ ok: false, msg: 'Error al obtener proveedores' });
  }
};

const crearProveedor = async (req, res) => {
  try {
    const datos = req.body;
    await ProveedorModel.insertarProveedor(datos);
    res.status(201).json({ mensaje: 'Proveedor creado correctamente' });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ mensaje: 'Error al crear el proveedor' });
  }
};

const buscarProveedorPorDocumento = async (req, res) => {
  try {
    const { documento } = req.params;
    const proveedor = await ProveedorModel.buscarPorDocumento(documento);

    if (!proveedor) {
      return res.status(404).json({ ok: false, mensaje: 'Proveedor no encontrado' });
    }

    res.json({ ok: true, data: proveedor });
  } catch (error) {
    console.error('❌ Error al buscar proveedor por documento:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al buscar proveedor' });
  }
};

const buscarProveedorPorDenominacion = async (req, res) => {
  try {
    const { denominacion } = req.params;
    const proveedor = await ProveedorModel.buscarPorDenominacion(denominacion);

    if (!proveedor) {
      return res.status(404).json({ ok: false, mensaje: 'Proveedor no encontrado' });
    }

    res.json({ ok: true, data: proveedor });
  } catch (error) {
    console.error('❌ Error al buscar proveedor por denominación:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al buscar proveedor' });
  }
};

const modificarProveedorPorDocumento = async (req, res) => {
  const { documento } = req.params;
  const camposActualizados = req.body;

  try {
    const resultado = await ProveedorModel.actualizarPorDocumento(documento, camposActualizados);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Proveedor no encontrado',
      });
    }

    res.json({
      ok: true,
      mensaje: 'Proveedor actualizado correctamente',
    });
  } catch (error) {
    console.error('Error al modificar proveedor:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al modificar proveedor',
    });
  }
};

const desactivarProveedor = async (req, res) => {
  const { documento } = req.params;

  try {
    const resultado = await ProveedorModel.desactivarProveedorPorDocumento(documento);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Proveedor no encontrado o ya estaba inactivo',
      });
    }

    res.json({
      ok: true,
      mensaje: 'Proveedor eliminado correctamente',
    });

  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al eliminar proveedor',
    });
  }
};

module.exports = {
  obtenerProveedores,
  crearProveedor,
  buscarProveedorPorDocumento,
  buscarProveedorPorDenominacion,
  modificarProveedorPorDocumento,
  desactivarProveedor,
};