const productosSeleccionados = [];
let clienteId = 1;
let empresaSeleccionada = null;
let formaDePago = 'EFECTIVO';
let tipoMoneda = 'UYU';
let tasaUsdUyu = null;
let destinoVolver = './cajeroUsuario.html';

const productoForm = document.getElementById('producto-form');
const productosBody = document.querySelector('#tabla-productos tbody');
const totalElement = document.getElementById('total');
const ventaMensaje = document.getElementById('venta-mensaje');
const volverPanelButton = document.getElementById('volver-panel');

function totalVenta() {
  return productosSeleccionados.reduce((total, producto) => total + producto.precioUnitario * producto.cantidad, 0);
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
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${escapeHtml(producto.descripcion)}</td>
      <td>${escapeHtml(formatearUyu(producto.precioUnitario))}</td>
      <td>${escapeHtml(producto.cantidad)}</td>
      <td>${escapeHtml(formatearUyu(producto.precioUnitario * producto.cantidad))}</td>
      <td><button class="cash-icon-button" type="button" data-producto-id="${escapeHtml(producto.productoId)}" aria-label="Quitar ${escapeHtml(producto.descripcion)}">Quitar</button></td>
    `;
    productosBody.append(fila);
  });
  totalElement.textContent = totalVenta().toFixed(2);
}

async function leerRespuesta(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.mensaje || payload.msg || 'No se pudo completar la operación.');
  }
  return payload;
}

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
  if (formaDePago === 'EFECTIVO') {
    mostrarModal('modal-moneda');
    return;
  }
  document.getElementById('resumen-pago').textContent = `Pago por ${formaDePago.toLowerCase()}.`;
  document.getElementById('finalizar-total').textContent = formatearUyu(totalVenta());
  mostrarMensaje(document.getElementById('finalizar-mensaje'));
  mostrarModal('modal-finalizar');
});

document.getElementById('confirmar-moneda').addEventListener('click', async () => {
  tipoMoneda = document.querySelector('input[name="tipo-moneda"]:checked').value;
  const total = totalVenta();
  try {
    if (tipoMoneda === 'USD') {
      const response = await fetch('/api/monedas/USD', { credentials: 'include' });
      const moneda = await leerRespuesta(response);
      tasaUsdUyu = Number(moneda.valor_en_pesos);
      document.getElementById('efectivo-total').textContent = `Total a cobrar: USD ${(total / tasaUsdUyu).toFixed(2)}. El cambio se entrega en pesos uruguayos.`;
    } else {
      tasaUsdUyu = null;
      document.getElementById('efectivo-total').textContent = `Total a cobrar: ${formatearUyu(total)}.`;
    }
    document.getElementById('monto-pagado').value = '';
    document.getElementById('monto-cambio').textContent = formatearUyu(0);
    mostrarMensaje(document.getElementById('efectivo-mensaje'));
    mostrarModal('modal-efectivo');
  } catch (error) {
    mostrarMensaje(document.getElementById('efectivo-mensaje'), error.message, 'error');
  }
});

document.getElementById('monto-pagado').addEventListener('input', () => {
  const montoPagado = Number(document.getElementById('monto-pagado').value) || 0;
  const totalEnMoneda = tipoMoneda === 'USD' ? totalVenta() / tasaUsdUyu : totalVenta();
  const cambioUyu = Math.max(0, montoPagado - totalEnMoneda) * (tipoMoneda === 'USD' ? tasaUsdUyu : 1);
  document.getElementById('monto-cambio').textContent = formatearUyu(cambioUyu);
});

async function finalizarCompra(montoPagado, mensajeElement, button) {
  if (button) button.disabled = true;
  mostrarMensaje(mensajeElement);
  try {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        clienteId,
        formaDePago,
        detalleTickets: productosSeleccionados.map(({ productoId, cantidad, precioUnitario }) => ({ productoId, cantidad, precioUnitario })),
        tipoMoneda: formaDePago === 'EFECTIVO' ? tipoMoneda : null,
        montoPagado: formaDePago === 'EFECTIVO' ? montoPagado : null,
      }),
    });
    const payload = await leerRespuesta(response);
    mostrarMensaje(mensajeElement, `Compra finalizada. Ticket #${payload.ticket_id}.`, 'success');
    window.setTimeout(() => window.location.reload(), 1100);
  } catch (error) {
    mostrarMensaje(mensajeElement, error.message, 'error');
    if (button) button.disabled = false;
  }
}

document.getElementById('finalizar-compra').addEventListener('click', (event) => {
  const montoPagado = Number(document.getElementById('monto-pagado').value);
  if (!Number.isFinite(montoPagado) || montoPagado < 0) {
    mostrarMensaje(document.getElementById('efectivo-mensaje'), 'Ingresa el monto entregado por el cliente.', 'error');
    return;
  }
  finalizarCompra(montoPagado, document.getElementById('efectivo-mensaje'), event.currentTarget);
});

document.getElementById('finalizar-compra-sin-efectivo').addEventListener('click', (event) => {
  finalizarCompra(null, document.getElementById('finalizar-mensaje'), event.currentTarget);
});

document.querySelectorAll('.cash-back').forEach((button) => {
  button.addEventListener('click', () => {
    const destino = button.dataset.volver;
    if (destino === 'venta') cerrarModales();
    else mostrarModal(`modal-${destino}`);
  });
});

volverPanelButton.addEventListener('click', () => {
  window.location.href = destinoVolver;
});

inicializarDestinoVolver();