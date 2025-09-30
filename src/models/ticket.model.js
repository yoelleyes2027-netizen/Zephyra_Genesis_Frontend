const db = require('../config/db');

const Ticket = {
  insertar: async ({ cliente_id, usuario_id, total, tipo_pago, forma_pago, tipo_comprobante, moneda }) => {
    const query = `
      INSERT INTO tickets (cliente_id, usuario_id, total, tipo_pago, forma_pago, tipo_comprobante, moneda)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [cliente_id, usuario_id, total, tipo_pago, forma_pago, tipo_comprobante, moneda]);
    return result.insertId;
  }
};

module.exports = Ticket;