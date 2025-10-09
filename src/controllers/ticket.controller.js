const Ticket = require('../models/ticket.model');
const DetallesTicket = require('../models/detallesTicket.model');

const crearTicket = async (req, res) => {
  try {
    const { cliente_id, tipo_pago, productos, forma_pago, tipo_comprobante, moneda, tipo_ticket, tasa_USD } = req.body;
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
      tipo_ticket,
      tasa_USD
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

const buscarTicketPorId = async (req, res) => {
  try {
    const { ticket_id } = req.params;

    if (!ticket_id) {
      return res.status(400).json({ ok: false, mensaje: 'ticket_id es requerido' });
    }

    const ticket = await Ticket.buscarPorId(ticket_id);

    if (!ticket) {
      return res.status(404).json({ ok: false, mensaje: 'Ticket no encontrado o inactivo' });
    }

    const productos = await Ticket.buscarPorTicket(ticket_id);

    res.status(200).json({ ok: true, ticket, productos });
    console.log({ ok: true, ticket, productos })

  } catch (error) {
    console.error('❌ Error al buscar ticket:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al buscar ticket' });
  }
};

const eliminarArticulosTicket = async (req, res) => {
  try {
    const { detalles_ids } = req.body;

    if (!detalles_ids || !Array.isArray(detalles_ids) || detalles_ids.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'detalles_ids es requerido y debe ser un array con al menos un ID.' });
    }

    const totalActualizados = await Ticket.desactivarPorIds(detalles_ids);

    res.status(200).json({
      success: true,
      mensaje: `${totalActualizados} artículo(s) eliminado(s) correctamente.`
    });
  } catch (error) {
    console.error('❌ Error al eliminar artículos del ticket:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar artículos del ticket' });
  }
};

module.exports = {
  crearTicket,
  desactivarTicket,
  buscarTicketPorId,
  eliminarArticulosTicket
};