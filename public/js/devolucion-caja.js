const productosSeleccionados = [];
let clienteId = 1;
let empresaSeleccionada = null;
let formaDePago = 'EFECTIVO';
let destinoVolver = './cajeroUsuario.html';

const autorizacionPanel = document.getElementById('autorizacion-panel');
const devolucionPanel = document.getElementById('devolucion-panel');
const productoForm = document.getElementById('producto-form');
const productosBody = document.querySelector('#tabla-productos tbody');
const totalElement = document.getElementById('total');
const ventaMensaje = document.getElementById('venta-mensaje');
const volverPanelButton = document.getElementById('volver-panel');

function totalVentaPositivo() {
  return productosSeleccionados.reduce((total, producto) => total + producto.precioUnitario * producto.cantidad, 0);
}

function totalDevolucion() {
  return -totalVentaPositivo();
}

function formatearUyu(monto) {
  return `UYU $${Number(monto || 0).toFixed(2)}`;
}

function mostrarMensaje(elemento, mensaje = '', tipo = '') {
  elemento.textContent = mensaje;
  elemento.className = `cash-message ${tipo}`.trim();
}

function mostrarModal(id) {
  document.querySelectorAll('.cash-modal').forEach((modal) => {
    modal.hidden = modal.id !== id;
  });
}

function cerrarModales() {
  document.querySelectorAll('.cash-modal').forEach((modal) => {
    modal.hidden = true;
  });
}

function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderizarProductos() {
  productosBody.replaceChildren();
  productosSeleccionados.forEach((producto) => {
    const subtotal = -(producto.precioUnitario * producto.cantidad);
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${escapeHtml(producto.descripcion)}</td>
      <td>${escapeHtml(formatearUyu(producto.precioUnitario))}</td>
      <td>${escapeHtml(producto.cantidad)}</td>
      <td>${escapeHtml(formatearUyu(subtotal))}</td>
      <td><button class="cash-icon-button" type="button" data-producto-id="${escapeHtml(producto.productoId)}" aria-label="Quitar ${escapeHtml(producto.descripcion)}">Quitar</button></td>
    `;
    productosBody.append(fila);
  });
  totalElement.textContent = totalDevolucion().toFixed(2);
}

async function leerRespuesta(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.mensaje || payload.msg || 'No se pudo completar la operación.');
  }
  return payload;
}

async function inicializarDestinoVolver() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('Sesión no válida');
    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    if (rol !== 'admin' && rol !== 'cajero') {
      window.location.href = './login.html';
      return;
    }
    destinoVolver = rol === 'admin' ? './adminUsuario.html' : './cajeroUsuario.html';
  } catch {
    window.location.href = './login.html';
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
      devolucionPanel.hidden = false;
      document.getElementById('codigo').focus();
    }, 350);
  } catch (error) {
    mostrarMensaje(mensaje, error.message, 'error');
  }
});

productoForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const codigo = document.getElementById('codigo').value.trim();
  const cantidad = Number(document.getElementById('cantidad').value);
  mostrarMensaje(ventaMensaje);

  if (!codigo || !Number.isInteger(cantidad) || cantidad <= 0) {
    mostrarMensaje(ventaMensaje, 'Ingresa un código y una cantidad válida.', 'error');
    return;
  }
  if (productosSeleccionados.some((producto) => String(producto.codigoDeBarras) === codigo)) {
    mostrarMensaje(ventaMensaje, 'El producto ya está en el ticket. Quita la línea y vuelve a agregarlo con la cantidad correcta.', 'error');
    return;
  }

  try {
    const response = await fetch(`/api/productos/${encodeURIComponent(codigo)}`, { credentials: 'include' });
    const producto = await leerRespuesta(response);
    if (producto.activo === false) {
      throw new Error('El producto está inactivo.');
    }
    productosSeleccionados.push({
      productoId: producto.id,
      codigoDeBarras: producto.codigoDeBarras,
      descripcion: producto.descripcion,
      cantidad,
      precioUnitario: Number(producto.precioVenta),
    });
    renderizarProductos();
    productoForm.reset();
    document.getElementById('cantidad').value = '1';
    document.getElementById('codigo').focus();
  } catch (error) {
    mostrarMensaje(ventaMensaje, error.message, 'error');
  }
});

productosBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-producto-id]');
  if (!button) return;
  const productoId = Number(button.dataset.productoId);
  const index = productosSeleccionados.findIndex((producto) => producto.productoId === productoId);
  if (index >= 0) {
    productosSeleccionados.splice(index, 1);
    renderizarProductos();
  }
});

document.getElementById('cerrar-ticket').addEventListener('click', () => {
  if (!productosSeleccionados.length) {
    mostrarMensaje(ventaMensaje, 'Agrega al menos un producto antes de cerrar el ticket.', 'error');
    return;
  }
  clienteId = 1;
  empresaSeleccionada = null;
  mostrarModal('modal-cliente');
});

document.getElementById('confirmar-cliente').addEventListener('click', () => {
  const tipoCliente = document.querySelector('input[name="tipo-cliente"]:checked').value;
  if (tipoCliente === 'empresa') {
    document.getElementById('rut-empresa').value = '';
    document.getElementById('empresa-encontrada').hidden = true;
    document.getElementById('confirmar-empresa').hidden = true;
    mostrarMensaje(document.getElementById('empresa-mensaje'));
    mostrarModal('modal-rut');
    return;
  }
  clienteId = 1;
  empresaSeleccionada = null;
  mostrarModal('modal-pago');
});

document.getElementById('buscar-empresa').addEventListener('click', async () => {
  const rut = document.getElementById('rut-empresa').value.trim();
  const mensaje = document.getElementById('empresa-mensaje');
  if (!rut) {
    mostrarMensaje(mensaje, 'Ingresa el RUT de la empresa.', 'error');
    return;
  }
  try {
    const response = await fetch(`/api/empresas/buscar/${encodeURIComponent(rut)}`, { credentials: 'include' });
    const payload = await leerRespuesta(response);
    empresaSeleccionada = payload.data;
    clienteId = empresaSeleccionada.id;
    const encontrada = document.getElementById('empresa-encontrada');
    encontrada.textContent = `Empresa: ${empresaSeleccionada.razonSocial || empresaSeleccionada.name}`;
    encontrada.hidden = false;
    document.getElementById('confirmar-empresa').hidden = false;
    mostrarMensaje(mensaje);
  } catch (error) {
    empresaSeleccionada = null;
    clienteId = 1;
    document.getElementById('empresa-encontrada').hidden = true;
    document.getElementById('confirmar-empresa').hidden = true;
    mostrarMensaje(mensaje, error.message, 'error');
  }
});

document.getElementById('confirmar-empresa').addEventListener('click', () => {
  if (!empresaSeleccionada) return;
  mostrarModal('modal-pago');
});

document.getElementById('confirmar-pago').addEventListener('click', () => {
  formaDePago = document.querySelector('input[name="forma-pago"]:checked').value;
  document.getElementById('resumen-pago').textContent = `Devolución por ${formaDePago.toLowerCase()}.`;
  document.getElementById('finalizar-total').textContent = formatearUyu(totalDevolucion());
  mostrarMensaje(document.getElementById('finalizar-mensaje'));
  mostrarModal('modal-finalizar');
});

async function finalizarDevolucionPorCaja(button) {
  button.disabled = true;
  const mensaje = document.getElementById('finalizar-mensaje');
  mostrarMensaje(mensaje);
  try {
    const response = await fetch('/api/tickets/devolucion-por-caja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        clienteId,
        formaDePago,
        detalleTickets: productosSeleccionados.map(({ productoId, cantidad, precioUnitario }) => ({
          productoId,
          cantidad,
          precioUnitario,
        })),
        tipoMoneda: 'UYU',
        montoPagado: 0,
      }),
    });
    const payload = await leerRespuesta(response);
    mostrarMensaje(mensaje, `Devolución por caja finalizada. Ticket #${payload.ticket_id}.`, 'success');
    window.setTimeout(() => window.location.reload(), 1100);
  } catch (error) {
    mostrarMensaje(mensaje, error.message, 'error');
    button.disabled = false;
  }
}

document.getElementById('finalizar-devolucion-caja').addEventListener('click', (event) => {
  finalizarDevolucionPorCaja(event.currentTarget);
});

document.querySelectorAll('.cash-back').forEach((button) => {
  button.addEventListener('click', () => {
    const destino = button.dataset.volver;
    if (destino === 'devolucion') {
      cerrarModales();
      return;
    }
    mostrarModal(`modal-${destino}`);
  });
});

volverPanelButton.addEventListener('click', () => {
  window.location.href = destinoVolver;
});

inicializarDestinoVolver();
