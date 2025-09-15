const Ticket = require('../models/ticket.model');
const DetallesTicket = require('../models/detallesTicket.model');

const crearTicket = async (req, res) => {
  try {
    const { cliente_id, tipo_pago, productos } = req.body;
    const usuario_id = req.usuario.id;

    // Calcular el total en el backend
    const total = productos.reduce((acc, prod) => acc + (prod.precio_unitario * prod.cantidad), 0);

    // Insertar ticket y obtener ID
    const ticket_id = await Ticket.insertar({
      cliente_id,
      usuario_id,
      total,
      tipo_pago,
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

module.exports = { crearTicket };