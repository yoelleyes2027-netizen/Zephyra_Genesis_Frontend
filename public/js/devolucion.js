let ticketSeleccionado = null;
let destinoVolver = './cajeroUsuario.html';

const autorizacionPanel = document.getElementById('autorizacion-panel');
const buscarTicketPanel = document.getElementById('buscar-ticket-panel');
const ticketDetallePanel = document.getElementById('ticket-detalle-panel');
const volverPanelButton = document.getElementById('volver-panel');

function mostrarMensaje(elemento, mensaje = '', tipo = '') {
  elemento.textContent = mensaje;
  elemento.className = `cash-message ${tipo}`.trim();
}

async function leerRespuesta(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.mensaje || payload.msg || 'No se pudo completar la operación.');
  }
  return payload;
}

function formatearUyu(monto) {
  return `UYU $${Number(monto || 0).toFixed(2)}`;
}

async function inicializarDestinoVolver() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) return;
    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    destinoVolver = rol === 'admin' ? './adminUsuario.html' : './cajeroUsuario.html';
  } catch {
    destinoVolver = './login.html';
  }
}

document.getElementById('autorizacion-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const mensaje = document.getElementById('autorizacion-mensaje');
  const cedula = Number(document.getElementById('autorizacion-cedula').value);
  const contraseña = document.getElementById('autorizacion-password').value;
  try {
    const response = await fetch('/api/tickets/devoluciones/autorizacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cedula, contraseña }),
    });
    await leerRespuesta(response);
    mostrarMensaje(mensaje, 'Autorización aprobada.', 'success');
    window.setTimeout(() => {
      autorizacionPanel.hidden = true;
      buscarTicketPanel.hidden = false;
      document.getElementById('ticket-id').focus();
    }, 500);
  } catch (error) {
    console.error('Autorización de devolución denegada:', error);
    mostrarMensaje(mensaje, 'Autorización denegada. Volviendo al panel de cajero.', 'error');
    window.setTimeout(() => {
      window.top.location.href = destinoVolver;
    }, 1200);
  }
});

document.getElementById('buscar-ticket-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const mensaje = document.getElementById('ticket-mensaje');
  const nroTicket = Number(document.getElementById('ticket-id').value);
  if (!Number.isInteger(nroTicket) || nroTicket <= 0) {
    mostrarMensaje(mensaje, 'Ingresa un nro de ticket válido.', 'error');
    return;
  }
  try {
    const response = await fetch(`/api/tickets/nro/${nroTicket}`, { credentials: 'include' });
    const payload = await leerRespuesta(response);
    ticketSeleccionado = payload.ticket;
    if (ticketSeleccionado.devolucion) {
      throw new Error('No se puede devolver un ticket que ya es una devolución.');
    }
    if (ticketSeleccionado.devolucionRealizada) {
      throw new Error('Este ticket ya tiene una devolución realizada.');
    }
    renderizarTicket(ticketSeleccionado);
    ticketDetallePanel.hidden = false;
    mostrarMensaje(mensaje);
  } catch (error) {
    ticketSeleccionado = null;
    ticketDetallePanel.hidden = true;
    mostrarMensaje(mensaje, error.message, 'error');
  }
});

function renderizarTicket(ticket) {
  const datos = document.getElementById('ticket-datos');
  const fecha = ticket.fechaCreacion ? new Date(ticket.fechaCreacion).toLocaleString('es-UY') : 'No disponible';
  const nroBuscado = Number(document.getElementById('ticket-id').value);
  datos.innerHTML = `
    <div><dt>Nro ticket</dt><dd>${Number.isInteger(nroBuscado) && nroBuscado > 0 ? nroBuscado : '-'}</dd></div>
    <div><dt>ID documento</dt><dd>${ticket.id}</dd></div>
    <div><dt>Fecha</dt><dd>${fecha}</dd></div>
    <div><dt>Cliente</dt><dd>${ticket.clienteNombre || `ID ${ticket.clienteId}`}</dd></div>
    <div><dt>Total</dt><dd>${formatearUyu(ticket.montoTotal)}</dd></div>
    <div><dt>Pago original</dt><dd>${ticket.formaDePago || 'No disponible'}</dd></div>
  `;
  const body = document.querySelector('#ticket-detalle-tabla tbody');
  body.replaceChildren();
  (ticket.detalleTickets || []).forEach((detalle) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${detalle.productoDescripcion || `Producto #${detalle.productoId}`}</td>
      <td>${formatearUyu(detalle.precioUnitario)}</td>
      <td>${detalle.cantidad}</td>
      <td>${formatearUyu(detalle.subtotal)}</td>
    `;
    body.append(fila);
  });
}

document.getElementById('iniciar-devolucion').addEventListener('click', () => {
  if (ticketSeleccionado) {
    document.getElementById('modal-pago-devolucion').hidden = false;
  }
});

document.getElementById('cancelar-devolucion').addEventListener('click', () => {
  document.getElementById('modal-pago-devolucion').hidden = true;
});

document.getElementById('finalizar-devolucion').addEventListener('click', async (event) => {
  if (!ticketSeleccionado) return;
  const button = event.currentTarget;
  const mensaje = document.getElementById('devolucion-mensaje');
  const formaDePago = document.querySelector('input[name="forma-pago-devolucion"]:checked').value;
  button.disabled = true;
  mostrarMensaje(mensaje);
  try {
    const response = await fetch(`/api/tickets/${ticketSeleccionado.id}/devolucion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ formaDePago }),
    });
    const payload = await leerRespuesta(response);
    mostrarMensaje(mensaje, `Devolución finalizada. Ticket #${payload.ticket_id}.`, 'success');
    window.setTimeout(() => window.location.reload(), 1100);
  } catch (error) {
    mostrarMensaje(mensaje, error.message, 'error');
    button.disabled = false;
  }
});

volverPanelButton.addEventListener('click', () => {
  window.location.href = destinoVolver;
});

inicializarDestinoVolver();