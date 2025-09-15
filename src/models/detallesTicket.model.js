const db = require('../config/db');

const DetallesTicket = {
  insertar: async ({ ticket_id, producto_id, cantidad, precio_unitario, subtotal }) => {
    const query = `
      INSERT INTO detalles_ticket (ticket_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(query, [ticket_id, producto_id, cantidad, precio_unitario, subtotal]);
  }
};

module.exports = DetallesTicket;