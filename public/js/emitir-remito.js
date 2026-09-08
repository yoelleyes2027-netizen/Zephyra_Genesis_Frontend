const proveedorSelect = document.getElementById('proveedor');
const fechaInput = document.getElementById('fecha');
const buscarPorSerie = document.getElementById('buscar-por-serie');
const serieBusqueda = document.getElementById('serie-busqueda');
const nroSerieInput = document.getElementById('nro-serie');
const facturasListado = document.getElementById('facturas-listado');
const detalleFacturaBody = document.getElementById('detalle-factura-body');
const remitoBody = document.getElementById('remito-body');
const mensaje = document.getElementById('mensaje');
const facturaResumen = document.getElementById('factura-resumen');
const btnEmitirRemito = document.getElementById('btn-emitir-remito');

let proveedoresCache = [];
let facturasCache = [];
let facturaSeleccionada = null;
let remitoSeleccion = [];

function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mostrarMensaje(texto = '', tipo = '') {
  mensaje.textContent = texto;
  mensaje.className = 'mt-3 mb-0';
  if (tipo === 'error') {
    mensaje.classList.add('text-danger');
  } else if (tipo === 'success') {
    mensaje.classList.add('text-success');
  }
}

function normalizarFecha(valor) {
  if (!valor) return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toISOString().slice(0, 10);
}

function normalizarFacturas(items) {
  return (items || []).map((factura) => {
    const fechaEmision = normalizarFecha(factura.fechaEmision || factura.fecha_emision);
    const fechaCreacion = normalizarFecha(factura.fechaCreacion || factura.fecha_creacion);
    const fechaReferencia = fechaEmision || fechaCreacion;

    const detallesRaw = factura.detallesFactura || factura.detalles || factura.detalleFactura || [];
    const detalles = detallesRaw.map((detalle) => ({
      productoId: Number(detalle.productoId || detalle.producto?.id),
      productoDescripcion: detalle.productoDescripcion || detalle.producto?.descripcion || `Producto #${detalle.productoId || detalle.producto?.id || '?'}`,
      cantidad: Number(detalle.cantidad || 0),
    }));

    return {
      id: Number(factura.id),
      nroFactura: factura.nroFactura || factura.nro_factura || factura.id,
      nroSerie: factura.nroSerie || factura.nro_serie || '',
      proveedorId: Number(factura.proveedorId || factura.proveedor?.id),
      proveedorNombre: factura.proveedorRazonSocial || factura.proveedor?.razonSocial || 'Proveedor sin nombre',
      fechaReferencia,
      detalles,
    };
  }).filter((factura) => Number.isFinite(factura.id));
}

async function leerPayload(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.msg || payload.mensaje || 'No se pudo completar la operación.');
  }
  return payload;
}

async function validarRol() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('Sesión inválida');
    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    if (rol !== 'admin' && rol !== 'recepcion') {
      throw new Error('Sin permisos');
    }
  } catch {
    window.location.href = './login.html';
  }
}

async function cargarProveedores() {
  const response = await fetch('/api/proveedores', { credentials: 'include' });
  const payload = await leerPayload(response);
  proveedoresCache = payload.data || [];

  for (const proveedor of proveedoresCache) {
    const option = document.createElement('option');
    option.value = proveedor.id;
    option.textContent = proveedor.razonSocial;
    proveedorSelect.append(option);
  }
}

function construirQueryFacturas() {
  const query = new URLSearchParams();

  if (buscarPorSerie.checked) {
    const serie = nroSerieInput.value.trim();
    if (!serie) {
      throw new Error('Ingresa un número de serie para buscar.');
    }
    query.set('nroSerie', serie);
    return query;
  }

  if (!proveedorSelect.value) {
    throw new Error('Selecciona un proveedor.');
  }
  if (!fechaInput.value) {
    throw new Error('Selecciona una fecha.');
  }

  query.set('proveedorId', proveedorSelect.value);
  query.set('fecha', fechaInput.value);
  return query;
}

async function obtenerFacturas(query) {
  const endpoints = [
    `/api/facturas/remito/buscar?${query}`,
    `/api/facturas/buscar-remito?${query}`,
    `/api/facturas?${query}`,
  ];

  let ultimoError = null;
  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, { credentials: 'include' });
    if (response.status === 404) {
      continue;
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      ultimoError = new Error(payload.msg || payload.mensaje || 'No se pudieron consultar las facturas.');
      break;
    }
    const payload = await response.json().catch(() => ({}));
    return payload.data || payload.facturas || payload.factura || [];
  }

  if (ultimoError) throw ultimoError;
  throw new Error('No existe endpoint de búsqueda de facturas para remito en el backend.');
}

function renderizarFacturas() {
  facturasListado.replaceChildren();

  if (!facturasCache.length) {
    facturasListado.textContent = 'No se encontraron facturas para el criterio ingresado.';
    return;
  }

  for (const factura of facturasCache) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `list-group-item factura-fila${facturaSeleccionada?.id === factura.id ? ' active' : ''}`;
    item.innerHTML = `
      <strong>Factura #${escapeHtml(factura.nroFactura)}</strong>
      <div class="meta">Proveedor: ${escapeHtml(factura.proveedorNombre)} | Serie: ${escapeHtml(factura.nroSerie || 'Sin serie')} | Fecha: ${escapeHtml(factura.fechaReferencia || '-')}</div>
    `;
    item.addEventListener('click', () => seleccionarFactura(factura.id));
    facturasListado.append(item);
  }
}

function obtenerCantidadDisponible(productoId, cantidadFactura) {
  const existente = remitoSeleccion.find((item) => item.productoId === productoId);
  return Math.max(0, Number(cantidadFactura) - Number(existente?.cantidad || 0));
}

function renderizarDetalleFactura() {
  detalleFacturaBody.replaceChildren();

  if (!facturaSeleccionada) {
    facturaResumen.textContent = 'Selecciona una factura para ver su detalle.';
    return;
  }

  facturaResumen.textContent = `Factura #${facturaSeleccionada.nroFactura} - ${facturaSeleccionada.proveedorNombre}`;

  for (const detalle of facturaSeleccionada.detalles) {
    const disponible = obtenerCantidadDisponible(detalle.productoId, detalle.cantidad);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(detalle.productoDescripcion)}</td>
      <td>${escapeHtml(detalle.cantidad)}</td>
      <td>${escapeHtml(disponible)}</td>
      <td>
        <input class="form-control form-control-sm cantidad-remito" type="number" min="1" max="${escapeHtml(disponible)}" value="1" ${disponible <= 0 ? 'disabled' : ''}>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary" type="button" ${disponible <= 0 ? 'disabled' : ''}>Agregar</button>
      </td>
    `;

    const cantidadInput = row.querySelector('input');
    const agregarButton = row.querySelector('button');
    agregarButton.addEventListener('click', () => {
      const cantidad = Number(cantidadInput.value);
      agregarProductoARemito(detalle, cantidad);
    });

    detalleFacturaBody.append(row);
  }
}

function agregarProductoARemito(detalle, cantidad) {
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    mostrarMensaje('La cantidad debe ser un número entero mayor a 0.', 'error');
    return;
  }

  const disponible = obtenerCantidadDisponible(detalle.productoId, detalle.cantidad);
  if (cantidad > disponible) {
    mostrarMensaje(`No puedes agregar más de ${disponible} unidades para ${detalle.productoDescripcion}.`, 'error');
    return;
  }

  const existente = remitoSeleccion.find((item) => item.productoId === detalle.productoId);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    remitoSeleccion.push({
      productoId: detalle.productoId,
      productoDescripcion: detalle.productoDescripcion,
      cantidad,
    });
  }

  mostrarMensaje('Producto agregado al remito.', 'success');
  renderizarDetalleFactura();
  renderizarRemito();
}

function quitarProductoRemito(productoId) {
  remitoSeleccion = remitoSeleccion.filter((item) => item.productoId !== productoId);
  renderizarDetalleFactura();
  renderizarRemito();
}

function renderizarRemito() {
  remitoBody.replaceChildren();

  for (const item of remitoSeleccion) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(item.productoDescripcion)}</td>
      <td>${escapeHtml(item.cantidad)}</td>
      <td class="text-end"><button class="btn btn-sm btn-outline-danger" type="button">Quitar</button></td>
    `;
    row.querySelector('button').addEventListener('click', () => quitarProductoRemito(item.productoId));
    remitoBody.append(row);
  }

  btnEmitirRemito.disabled = !facturaSeleccionada || remitoSeleccion.length === 0;
}

function seleccionarFactura(facturaId) {
  facturaSeleccionada = facturasCache.find((item) => item.id === facturaId) || null;
  remitoSeleccion = [];
  renderizarFacturas();
  renderizarDetalleFactura();
  renderizarRemito();
}

function alternarModoBusqueda() {
  const porSerie = buscarPorSerie.checked;

  serieBusqueda.hidden = !porSerie;
  document.getElementById('seccion-proveedor').hidden = porSerie;
  document.getElementById('seccion-fecha').hidden = porSerie;

  if (porSerie) {
    proveedorSelect.value = '';
    fechaInput.value = '';
  } else {
    nroSerieInput.value = '';
  }

  facturasCache = [];
  facturaSeleccionada = null;
  remitoSeleccion = [];
  renderizarFacturas();
  renderizarDetalleFactura();
  renderizarRemito();
  mostrarMensaje('');
}

async function buscarFacturas() {
  try {
    mostrarMensaje('Buscando facturas...');
    const query = construirQueryFacturas();
    const facturasRaw = await obtenerFacturas(query);
    facturasCache = normalizarFacturas(facturasRaw);
    facturaSeleccionada = null;
    remitoSeleccion = [];
    renderizarFacturas();
    renderizarDetalleFactura();
    renderizarRemito();
    mostrarMensaje(`Se encontraron ${facturasCache.length} factura(s).`, 'success');
  } catch (error) {
    facturasCache = [];
    facturaSeleccionada = null;
    remitoSeleccion = [];
    renderizarFacturas();
    renderizarDetalleFactura();
    renderizarRemito();
    mostrarMensaje(error.message, 'error');
  }
}

btnEmitirRemito.addEventListener('click', async () => {
  if (!facturaSeleccionada || !remitoSeleccion.length) {
    mostrarMensaje('Selecciona una factura y al menos un producto.', 'error');
    return;
  }

  const body = {
    facturaId: facturaSeleccionada.id,
    detalles: remitoSeleccion.map((item) => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
    })),
  };

  try {
    const response = await fetch('/api/remitos', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.status === 404) {
      mostrarMensaje('El endpoint /api/remitos aún no está implementado en backend. El armado del remito ya queda listo en pantalla.', 'error');
      return;
    }

    await leerPayload(response);
    mostrarMensaje('Remito emitido correctamente.', 'success');
    remitoSeleccion = [];
    renderizarDetalleFactura();
    renderizarRemito();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
});

document.getElementById('btn-buscar-fecha').addEventListener('click', buscarFacturas);
document.getElementById('btn-buscar-serie').addEventListener('click', buscarFacturas);
document.getElementById('btn-volver').addEventListener('click', () => window.history.back());
buscarPorSerie.addEventListener('change', alternarModoBusqueda);

async function init() {
  await validarRol();
  await cargarProveedores();
  renderizarFacturas();
  renderizarDetalleFactura();
  renderizarRemito();
}

init();
