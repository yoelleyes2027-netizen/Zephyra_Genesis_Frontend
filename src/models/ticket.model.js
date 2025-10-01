const db = require('../config/db');

const Ticket = {
  insertar: async ({ cliente_id, usuario_id, total, tipo_pago, forma_pago, tipo_comprobante, moneda }) => {
    const query = `
      INSERT INTO tickets (cliente_id, usuario_id, total, tipo_pago, forma_pago, tipo_comprobante, moneda)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [cliente_id, usuario_id, total, tipo_pago, forma_pago, tipo_comprobante, moneda]);
    return result.insertId;
  },

  desactivar: async (ticket_id) => {
    const query = `
      UPDATE tickets
      SET activo = 0
      WHERE id = ?
    `;
    const [result] = await db.query(query, [ticket_id]);
    return result.affectedRows; // devuelve cuántas filas se actualizaron
  }
};

module.exports = Ticket;