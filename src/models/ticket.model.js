const db = require('../config/db');

const Ticket = {
  insertar: async ({ cliente_id, usuario_id, total, tipo_pago, forma_pago, tipo_comprobante, moneda, tipo_ticket, tasa_USD }) => {
    const query = `
      INSERT INTO tickets (cliente_id, usuario_id, total, tipo_pago, forma_pago, tipo_comprobante, moneda, tipo_ticket, tipo_cambio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [cliente_id, usuario_id, total, tipo_pago, forma_pago, tipo_comprobante, moneda, tipo_ticket, tasa_USD]);
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
  },

  buscarPorId: async (ticket_id) => {
    const query = `
      SELECT 
        tickets.*, 
        
        -- Datos del cliente
        clientes.id AS cliente_id, 
        clientes.nombre AS cliente_nombre, 
        clientes.telefono AS cliente_telefono, 
        clientes.email AS cliente_email, 
        clientes.direccion AS cliente_direccion,
        clientes.tipo_documento,
        clientes.codigo_pais,
        clientes.denominacion,
        clientes.numero_doc,
        
        -- Datos del usuario que hizo el ticket
        usuarios.id AS usuario_id,
        usuarios.nombre AS usuario_nombre
        
      FROM tickets
      JOIN clientes ON tickets.cliente_id = clientes.id
      JOIN usuarios ON tickets.usuario_id = usuarios.id
      WHERE tickets.id = ? AND tickets.activo = 1
    `;

    const [result] = await db.query(query, [ticket_id]);
    return result[0]; // null si no existe o no está activo
  },

  buscarPorTicket: async (ticket_id) => {
    const query = `
      SELECT 
        dt.id,
        dt.producto_id, 
        p.descripcion,
        dt.cantidad, 
        dt.precio_unitario, 
        dt.subtotal
      FROM detalles_ticket dt
      JOIN productos p ON dt.producto_id = p.id
      WHERE dt.ticket_id = ? AND dt.activo = 1
    `;
    const [result] = await db.query(query, [ticket_id]);
    return result;
  },

  /** (Esta funcion hace lo mismo que la de obtenerLineas pero la tengo repetida ya que se usan en dos flujos distintos y no las voy a unificar ahora)
 * Devuelve {producto_id, cantidad} de los detalles activos por sus IDs.
 * Útil para ajustar stock al devolver artículos.
 */
  obtenerLineasPorDetalleIds: async (detallesIds, connection = null) => {
    const conn = connection || db;
    if (!Array.isArray(detallesIds) || detallesIds.length === 0) return [];

    const placeholders = detallesIds.map(() => '?').join(',');
    const [rows] = await conn.query(
      `
          SELECT producto_id, cantidad
          FROM detalles_ticket
          WHERE id IN (${placeholders}) AND activo = 1
        `,
      detallesIds
    );
    return rows; // [{producto_id, cantidad}, ...]
  },

  /**
   * Marca inactivos los detalles (acepta conexión para usarse en la misma tx).
   */
  desactivarPorIds: async (detallesIds, connection = null) => {
    const conn = connection || db;
    if (!Array.isArray(detallesIds) || detallesIds.length === 0) return 0;

    const placeholders = detallesIds.map(() => '?').join(',');
    const [result] = await conn.query(
      `
          UPDATE detalles_ticket
          SET activo = 0
          WHERE id IN (${placeholders}) AND activo = 1
        `,
      detallesIds
    );
    return result.affectedRows;
  },


  /**
   * Devuelve las líneas del ticket (producto_id, cantidad).
   * Ajustá el nombre de la tabla si difiere en tu esquema.
   */
  obtenerLineas: async (ticket_id, connection = null) => {
    const conn = connection || db;
    const [rows] = await conn.query(
      // Cambia 'ticket_detalles' por tu nombre real si fuera distinto
      'SELECT producto_id, cantidad FROM detalles_ticket WHERE ticket_id = ? AND activo = 1',
      [ticket_id]
    );
    return rows;
  },
};

module.exports = Ticket;