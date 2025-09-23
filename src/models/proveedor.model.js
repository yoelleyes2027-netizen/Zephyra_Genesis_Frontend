const pool = require('../config/db');

const ProveedorModel = {
  obtenerTodos: async () => {
    const [rows] = await pool.query('SELECT * FROM proveedores WHERE activo = 1');
    return rows;
  },

  insertarProveedor: async ({ nombre, telefono, email, direccion, documento, denominacion }) => {
    const query = `
      INSERT INTO proveedores (nombre, telefono, email, direccion, documento, denominacion)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const valores = [nombre, telefono, email, direccion, documento, denominacion];
    await pool.query(query, valores);
  },

  buscarPorDocumento: async (documento) => {
    const query = 'SELECT * FROM proveedores WHERE documento = ? AND activo = 1';
    const [rows] = await pool.query(query, [documento]);
    return rows[0];
  },

  buscarPorDenominacion: async (denominacion) => {
    const query = 'SELECT * FROM proveedores WHERE denominacion LIKE ? AND activo = 1';
    const [rows] = await pool.query(query, [denominacion]);
    return rows[0];
  },

  actualizarPorDocumento: async (documento, camposActualizados) => {
    const campos = Object.keys(camposActualizados);
    const valores = Object.values(camposActualizados);

    if (campos.length === 0) {
      throw new Error('No se proporcionaron campos para actualizar');
    }

    const setClause = campos.map(campo => `${campo} = ?`).join(', ');
    const query = `UPDATE proveedores SET ${setClause} WHERE documento = ?`;

    valores.push(documento); // El documento va al final para el WHERE

    const [result] = await pool.query(query, valores);
    return result;
  },

  // Eliminar (inactivar) proveedor por documento
  desactivarProveedorPorDocumento: async (documento) => {
    const query = 'UPDATE proveedores SET activo = 0 WHERE documento = ?';
    const [result] = await pool.query(query, [documento]);
    return result;
  }
};

module.exports = ProveedorModel;