const db = require('../config/db');

const Ticket = {
  insertar: async ({ cliente_id, usuario_id, total, tipo_pago }) => {
    const query = `
      INSERT INTO tickets (cliente_id, usuario_id, total, tipo_pago)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [cliente_id, usuario_id, total, tipo_pago]);
    return result.insertId;
  }
};

module.exports = Ticket;