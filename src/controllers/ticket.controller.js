const Ticket = require('../models/ticket.model');
const DetallesTicket = require('../models/detallesTicket.model');

const crearTicket = async (req, res) => {
  try {
    const { cliente_id, tipo_pago, productos, forma_pago, tipo_comprobante, moneda } = req.body;
    const usuario_id = req.usuario.id;

    // Calcular el total en el backend
    const total = productos.reduce((acc, prod) => acc + (prod.precio_unitario * prod.cantidad), 0);

    // Insertar ticket y obtener ID
    const ticket_id = await Ticket.insertar({
      cliente_id,
      usuario_id,
      total,
      tipo_pago,
      forma_pago,
      tipo_comprobante,
      moneda,
    });

    // Insertar detalles
    for (const prod of productos) {
      await DetallesTicket.insertar({
        ticket_id,
        producto_id: prod.producto_id,
        cantidad: prod.cantidad,
        precio_unitario: prod.precio_unitario,
        subtotal: prod.precio_unitario * prod.cantidad,
      });
    }

    res.status(201).json({ ok: true, mensaje: 'Ticket creado con éxito', ticket_id });

  } catch (error) {
    console.error('❌ Error al crear ticket:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al crear ticket' });
  }
};

const desactivarTicket = async (req, res) => {
  try {
    const { ticket_id } = req.body;

    if (!ticket_id) {
      return res.status(400).json({ ok: false, mensaje: 'ticket_id es requerido' });
    }

    const updatedRows = await Ticket.desactivar(ticket_id);

    if (updatedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Ticket no encontrado' });
    }

    res.status(200).json({ ok: true, mensaje: 'Ticket desactivado con éxito' });
  } catch (error) {
    console.error('❌ Error al desactivar ticket:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al desactivar ticket' });
  }
};

module.exports = { 
  crearTicket,
  desactivarTicket
 };