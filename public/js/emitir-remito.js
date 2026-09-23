const proveedorSelect = document.getElementById('proveedor');
const fechaInput = document.getElementById('fecha');
const buscarSerieSiBtn = document.getElementById('buscar-serie-si');
const buscarSerieNoBtn = document.getElementById('buscar-serie-no');
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
let buscarPorSerieSeleccion = false;

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
  mensaje.className = 'mb-3';
  if (tipo === 'error') {
    mensaje.classList.add('text-danger');
  } else if (tipo === 'success') {
    mensaje.classList.add('text-success');
  }
}

function actualizarBotonesSiNo(siBtn, noBtn, valor) {
  siBtn.classList.toggle('active', valor === true);
  noBtn.classList.toggle('active', valor === false);
}

function formatearFechaLatamDesdeIso(fechaIso) {
  const match = String(fechaIso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return '';
  }
  const [, anio, mes, dia] = match;
  return `${dia}/${mes}/${anio}`;
}

function extraerPartesFechaEnUruguay(date) {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Montevideo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const dia = partes.find((parte) => parte.type === 'day')?.value;
  const mes = partes.find((parte) => parte.type === 'month')?.value;
  const anio = partes.find((parte) => parte.type === 'year')?.value;
  const hora = partes.find((parte) => parte.type === 'hour')?.value;
  const minuto = partes.find((parte) => parte.type === 'minute')?.value;

  if (!dia || !mes || !anio || !hora || !minuto) {
    return null;
  }

  return {
    fecha: `${dia}/${mes}/${anio}`,
    hora: `${hora}:${minuto}`,
  };
}

function formatearDateEnUruguay(date, incluirHora = true) {
  const partes = extraerPartesFechaEnUruguay(date);
  if (!partes) {
    return '';
  }
  if (!incluirHora) {
    return partes.fecha;
  }
  return `${partes.fecha} ${partes.hora}`;
}

function normalizarFecha(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return '';
  }

  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? '' : formatearDateEnUruguay(valor, true);
  }

  if (typeof valor === 'number') {
    const fechaDesdeNumero = new Date(valor);
    return Number.isNaN(fechaDesdeNumero.getTime()) ? '' : formatearDateEnUruguay(fechaDesdeNumero, true);
  }

  if (typeof valor === 'string') {
    const texto = valor.trim();
    if (!texto) {
      return '';
    }

    const matchFecha = texto.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}):(\d{2})(?::\d{2}(?:\.\d{1,3})?)?)?/);
    if (matchFecha) {
      const fecha = formatearFechaLatamDesdeIso(matchFecha[1]);
      const horas = matchFecha[2];
      const minutos = matchFecha[3];
      const tieneZonaHoraria = /(Z|[+-]\d{2}:?\d{2})$/i.test(texto);

      if (!tieneZonaHoraria) {
        if (!fecha) {
          return '';
        }
        return horas && minutos ? `${fecha} ${horas}:${minutos}` : fecha;
      }
    }

    const candidatoIso = texto.includes(' ') ? texto.replace(' ', 'T') : texto;
    const fechaDesdeTexto = new Date(candidatoIso);
    return Number.isNaN(fechaDesdeTexto.getTime()) ? '' : formatearDateEnUruguay(fechaDesdeTexto, true);
  }

  if (typeof valor === 'object') {
    if (typeof valor.time === 'number') {
      return normalizarFecha(valor.time);
    }
    if (valor.$date !== undefined) {
      return normalizarFecha(valor.$date);
    }
  }

  return '';
}

function normalizarFacturas(items) {
  return (items || []).map((factura) => {
    const fechaEmision = normalizarFecha(
      factura.fechaEmision
      ?? factura.fecha_emision
      ?? factura.documento?.fechaEmision
      ?? factura.documento?.fecha_emision,
    );

    const fechaCreacion = normalizarFecha(
      factura.fechaCreacion
      ?? factura.fecha_creacion
      ?? factura.documento?.fechaCreacion
      ?? factura.documento?.fecha_creacion,
    );

    const fechaReferencia = fechaEmision || fechaCreacion;
    const etiquetaFecha = fechaEmision
      ? 'Fecha Emision'
      : (fechaCreacion ? 'Fecha de Carga' : 'Fecha');

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
      etiquetaFecha,
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

  if (buscarPorSerieSeleccion) {
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
  const response = await fetch(`/api/facturas/buscar-remito?${query}`, { credentials: 'include' });
  if (response.status === 404) {
    throw new Error('La búsqueda de remitos no está disponible todavía en backend.');
  }
  const payload = await leerPayload(response);
  return payload.data || [];
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
      <strong>Factura</strong>
      <div class="meta">Proveedor: ${escapeHtml(factura.proveedorNombre)} | Nro de Serie: ${escapeHtml(factura.nroSerie || 'Sin serie')} | ${escapeHtml(factura.etiquetaFecha)}: ${escapeHtml(factura.fechaReferencia || '-')}</div>
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
  const porSerie = buscarPorSerieSeleccion;

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

function seleccionarBuscarPorSerie(valor) {
  buscarPorSerieSeleccion = valor;
  actualizarBotonesSiNo(buscarSerieSiBtn, buscarSerieNoBtn, valor);
  alternarModoBusqueda();
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
    const detalle = error?.message && error.message.trim()
      ? error.message
      : 'No se pudo emitir el remito.';
    mostrarMensaje(detalle, 'error');
  }
});

document.getElementById('btn-buscar-fecha').addEventListener('click', buscarFacturas);
document.getElementById('btn-buscar-serie').addEventListener('click', buscarFacturas);
document.getElementById('btn-volver').addEventListener('click', () => window.location.href = './facturas.html');
document.getElementById('btn-volver-atras').addEventListener('click', () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  window.location.href = './facturas.html';
});
document.getElementById('btn-volver-footer').addEventListener('click', () => window.location.href = './facturas.html');
buscarSerieSiBtn.addEventListener('click', () => seleccionarBuscarPorSerie(true));
buscarSerieNoBtn.addEventListener('click', () => seleccionarBuscarPorSerie(false));

async function init() {
  await validarRol();
  await cargarProveedores();
  seleccionarBuscarPorSerie(false);
  renderizarFacturas();
  renderizarDetalleFactura();
  renderizarRemito();
}

init();
