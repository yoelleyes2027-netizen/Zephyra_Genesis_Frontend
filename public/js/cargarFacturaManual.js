const proveedorSelect = document.getElementById('proveedor');
const monedaSelect = document.getElementById('moneda');
const busquedaInput = document.getElementById('busqueda');
const resultados = document.getElementById('resultados');
const detalleBody = document.getElementById('detalle-body');
const totalElemento = document.getElementById('total');
const mensaje = document.getElementById('mensaje');
const btnCargar = document.getElementById('btn-cargar');
const tieneSerie = document.getElementById('tiene-serie');
const serieField = document.getElementById('serie-field');
const nroSerie = document.getElementById('nro-serie');
const editarDialog = document.getElementById('editar-dialog');
const editarForm = document.getElementById('editar-form');
const editarCantidad = document.getElementById('editar-cantidad');
const editarPrecio = document.getElementById('editar-precio');
const cantidadDialog = document.getElementById('cantidad-dialog');
const cantidadForm = document.getElementById('cantidad-form');
const cantidadProducto = document.getElementById('cantidad-producto');
const cantidadInput = document.getElementById('cantidad-input');
const cantidadError = document.getElementById('cantidad-error');

let productosSeleccionados = [];
let productoEnEdicionId = null;
let productoPendienteAgregar = null;
let busquedaPendiente;

function formatoMoneda(valor) {
  return `${monedaSelect.value} ${Number(valor).toFixed(2)}`;
}

function mostrarMensaje(texto = '', tipo = '') {
  mensaje.textContent = texto;
  mensaje.className = 'mb-3';
  if (tipo === 'error') {
    mensaje.classList.add('text-danger', 'fw-semibold');
  } else if (tipo === 'success') {
    mensaje.classList.add('text-success', 'fw-semibold');
  }
}

async function leerRespuesta(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.mensaje || 'No se pudo completar la operacion.');
  return payload;
}

async function validarRol() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('Sesion no valida');
    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    if (rol !== 'admin' && rol !== 'recepcion') throw new Error('Sin permisos');
  } catch {
    window.location.href = './login.html';
  }
}

async function cargarProveedores() {
  try {
    const response = await fetch('/api/proveedores', { credentials: 'include' });
    const payload = await leerRespuesta(response);
    for (const proveedor of payload.data || []) {
      const option = document.createElement('option');
      option.value = proveedor.id;
      option.textContent = proveedor.razonSocial;
      proveedorSelect.append(option);
    }
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

async function buscarProductos() {
  const proveedorId = proveedorSelect.value;
  if (!proveedorId) return;
  resultados.replaceChildren();
  try {
    const query = new URLSearchParams({ proveedorId, busqueda: busquedaInput.value.trim() });
    const response = await fetch(`/api/productos/factura?${query}`, { credentials: 'include' });
    const payload = await leerRespuesta(response);
    renderizarResultados(payload.data || []);
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

function renderizarResultados(productos) {
  resultados.replaceChildren();
  if (!productos.length) {
    resultados.textContent = 'No hay productos que coincidan con la busqueda.';
    resultados.className = 'list-group mt-3 text-muted';
    return;
  }
  resultados.className = 'list-group mt-3';
  for (const producto of productos) {
    const article = document.createElement('article');
    article.className = 'list-group-item d-flex flex-wrap align-items-center justify-content-between gap-2';
    const datos = document.createElement('div');
    datos.innerHTML = `<strong class="d-block">${producto.descripcion}</strong><small class="text-muted">Codigo: ${producto.codigoDeBarras} | Etiqueta: ${producto.etiqueta}</small>`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary btn-sm';
    button.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i><span>Agregar</span>';
    button.disabled = productosSeleccionados.some((item) => item.id === producto.id);
    button.addEventListener('click', () => agregarProducto(producto));
    article.append(datos, button);
    resultados.append(article);
  }
}

function agregarProducto(producto) {
  abrirDialogoCantidad(producto);
}

function abrirDialogoCantidad(producto) {
  productoPendienteAgregar = producto;
  cantidadProducto.textContent = producto.descripcion;
  cantidadInput.value = '1';
  cantidadError.textContent = '';
  cantidadDialog.showModal();
  cantidadInput.focus();
}

function cerrarDialogoCantidad() {
  cantidadDialog.close();
  productoPendienteAgregar = null;
  cantidadError.textContent = '';
}

function agregarProductoConfirmado(cantidad) {
  if (!productoPendienteAgregar) {
    return;
  }

  productosSeleccionados.push({
    id: productoPendienteAgregar.id,
    descripcion: productoPendienteAgregar.descripcion,
    cantidad,
    precioCompra: Number(productoPendienteAgregar.precioCompra),
  });
  cerrarDialogoCantidad();
  renderizarDetalle();
  buscarProductos();
}

function renderizarDetalle() {
  detalleBody.replaceChildren();
  for (const producto of productosSeleccionados) {
    const row = document.createElement('tr');
    const subtotal = producto.cantidad * producto.precioCompra;
    row.innerHTML = `<td>${producto.descripcion}</td><td>${formatoMoneda(producto.precioCompra)}</td><td>${producto.cantidad}</td><td>${formatoMoneda(subtotal)}</td>`;
    const acciones = document.createElement('td');
    acciones.className = 'text-end text-nowrap';
    const editar = crearBotonAccion('fa-pen', 'Editar producto', () => abrirEdicion(producto.id));
    const quitar = crearBotonAccion('fa-trash', 'Quitar producto', () => quitarProducto(producto.id), 'danger');
    acciones.append(editar, quitar);
    row.append(acciones);
    detalleBody.append(row);
  }
  const total = productosSeleccionados.reduce((acumulado, producto) => acumulado + producto.cantidad * producto.precioCompra, 0);
  totalElemento.textContent = formatoMoneda(total);
  document.getElementById('detalle-vacio').hidden = productosSeleccionados.length > 0;
  btnCargar.disabled = productosSeleccionados.length === 0;
}

function crearBotonAccion(icono, etiqueta, onClick, clase = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `btn btn-sm ${clase === 'danger' ? 'btn-outline-danger' : 'btn-outline-secondary'} ms-1`;
  button.title = etiqueta;
  button.setAttribute('aria-label', etiqueta);
  button.innerHTML = `<i class="fas ${icono}" aria-hidden="true"></i>`;
  button.addEventListener('click', onClick);
  return button;
}

function quitarProducto(productoId) {
  productosSeleccionados = productosSeleccionados.filter((producto) => producto.id !== productoId);
  renderizarDetalle();
  buscarProductos();
}

function abrirEdicion(productoId) {
  const producto = productosSeleccionados.find((item) => item.id === productoId);
  if (!producto) return;
  productoEnEdicionId = productoId;
  document.getElementById('editar-producto').textContent = producto.descripcion;
  editarCantidad.value = producto.cantidad;
  editarPrecio.value = producto.precioCompra.toFixed(2);
  editarDialog.showModal();
  editarCantidad.focus();
}

editarForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const cantidad = Number(editarCantidad.value);
  const precioCompra = Number(editarPrecio.value);
  if (!Number.isInteger(cantidad) || cantidad <= 0 || !Number.isFinite(precioCompra) || precioCompra < 0) return;
  const producto = productosSeleccionados.find((item) => item.id === productoEnEdicionId);
  if (producto) {
    producto.cantidad = cantidad;
    producto.precioCompra = precioCompra;
  }
  editarDialog.close();
  renderizarDetalle();
});

cantidadForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const cantidad = Number(cantidadInput.value);
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    cantidadError.textContent = 'La cantidad debe ser un numero entero mayor a 0.';
    return;
  }
  agregarProductoConfirmado(cantidad);
});

document.getElementById('btn-cerrar-edicion').addEventListener('click', () => editarDialog.close());
document.getElementById('btn-cancelar-edicion').addEventListener('click', () => editarDialog.close());
document.getElementById('btn-cerrar-cantidad').addEventListener('click', cerrarDialogoCantidad);
document.getElementById('btn-cancelar-cantidad').addEventListener('click', cerrarDialogoCantidad);
cantidadDialog.addEventListener('cancel', () => {
  productoPendienteAgregar = null;
  cantidadError.textContent = '';
});

tieneSerie.addEventListener('change', () => {
  serieField.hidden = !tieneSerie.checked;
  if (!tieneSerie.checked) nroSerie.value = '';
});

proveedorSelect.addEventListener('change', () => {
  busquedaInput.disabled = !proveedorSelect.value;
  document.getElementById('busqueda-ayuda').hidden = Boolean(proveedorSelect.value);
  productosSeleccionados = [];
  renderizarDetalle();
  buscarProductos();
});

busquedaInput.addEventListener('input', () => {
  window.clearTimeout(busquedaPendiente);
  busquedaPendiente = window.setTimeout(buscarProductos, 250);
});

monedaSelect.addEventListener('change', renderizarDetalle);

btnCargar.addEventListener('click', async () => {
  if (tieneSerie.checked && !nroSerie.value.trim()) {
    mostrarMensaje('Ingresa el numero de serie de la factura.', 'error');
    nroSerie.focus();
    return;
  }
  btnCargar.disabled = true;
  mostrarMensaje();
  try {
    const response = await fetch('/api/facturas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        proveedorId: Number(proveedorSelect.value),
        tipoMoneda: monedaSelect.value,
        nroSerie: tieneSerie.checked ? nroSerie.value.trim() : null,
        detalles: productosSeleccionados.map((producto) => ({
          productoId: producto.id,
          cantidad: producto.cantidad,
          precioCompra: producto.precioCompra,
        })),
      }),
    });
    const payload = await leerRespuesta(response);
    mostrarMensaje(`Factura #${payload.factura.nroFactura} cargada correctamente.`, 'success');
    productosSeleccionados = [];
    renderizarDetalle();
    resultados.replaceChildren();
    tieneSerie.checked = false;
    serieField.hidden = true;
    nroSerie.value = '';
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  } finally {
    btnCargar.disabled = productosSeleccionados.length === 0;
  }
});

function volverAFacturas() {
  window.location.href = './facturas.html';
}

document.getElementById('btn-volver').addEventListener('click', volverAFacturas);
document.getElementById('btn-volver-atras').addEventListener('click', () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  volverAFacturas();
});

validarRol();
cargarProveedores();
renderizarDetalle();
