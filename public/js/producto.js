const productoForm = document.getElementById('producto-form');
const productoSubmit = document.getElementById('producto-submit');
const productoCancelar = document.getElementById('producto-cancelar');
const productoBuscar = document.getElementById('producto-buscar');
const productoVerTodos = document.getElementById('producto-ver-todos');
const productoBody = document.getElementById('producto-body');
const productoBusqueda = document.getElementById('producto-busqueda');
const productoBuscarPor = document.getElementById('producto-buscar-por');
const productoProveedor = document.getElementById('producto-proveedor');
const productoEditModal = document.getElementById('producto-edit-modal');
const productoEditForm = document.getElementById('producto-edit-form');
const productoEditCodigo = document.getElementById('producto-edit-codigo');
const productoEditDescripcion = document.getElementById('producto-edit-descripcion');
const productoEditPrecioVenta = document.getElementById('producto-edit-precio-venta');
const productoEditPrecioCompra = document.getElementById('producto-edit-precio-compra');
const productoEditStock = document.getElementById('producto-edit-stock');
const productoEditUnidad = document.getElementById('producto-edit-unidad');
const productoEditEtiqueta = document.getElementById('producto-edit-etiqueta');
const productoEditProveedor = document.getElementById('producto-edit-proveedor');

let productosCache = [];
let codigoEdicionProducto = null;

function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formDataProducto() {
  return {
    codigoDeBarras: Number(document.getElementById('producto-codigo').value),
    descripcion: document.getElementById('producto-descripcion').value.trim(),
    precioVenta: Number(document.getElementById('producto-precio-venta').value),
    precioCompra: Number(document.getElementById('producto-precio-compra').value),
    stock: Number(document.getElementById('producto-stock').value),
    unidadDeMedida: document.getElementById('producto-unidad').value.trim().toUpperCase(),
    etiqueta: document.getElementById('producto-etiqueta').value.trim(),
    proveedorNumeroDocumento: productoProveedor.value.trim(),
  };
}

function limpiarFormulario() {
  productoForm.reset();
  productoSubmit.textContent = 'Guardar producto';
  document.getElementById('producto-unidad').value = 'UNIDAD';
  productoProveedor.value = '';
}

function abrirModalEdicionProducto(producto) {
  codigoEdicionProducto = Number(producto.codigoDeBarras);
  productoEditCodigo.value = producto.codigoDeBarras ?? '';
  productoEditDescripcion.value = producto.descripcion ?? '';
  productoEditPrecioVenta.value = producto.precioVenta ?? '';
  productoEditPrecioCompra.value = producto.precioCompra ?? '';
  productoEditStock.value = producto.stock ?? '';
  productoEditUnidad.value = producto.unidadDeMedida ?? 'UNIDAD';
  productoEditEtiqueta.value = producto.etiqueta ?? '';
  productoEditProveedor.value = producto.proveedorNumeroDocumento ?? '';
  productoEditModal.classList.remove('d-none');
  productoEditModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  window.setTimeout(() => productoEditDescripcion.focus(), 0);
}

function cerrarModalEdicionProducto() {
  codigoEdicionProducto = null;
  productoEditForm.reset();
  productoEditUnidad.value = 'UNIDAD';
  productoEditProveedor.value = '';
  productoEditModal.classList.add('d-none');
  productoEditModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function normalizarTexto(valor) {
  return String(valor ?? '').trim().toLowerCase();
}

function filtrarProductosLocal(valor, criterio) {
  const texto = normalizarTexto(valor);
  if (!texto) {
    return productosCache;
  }

  switch (criterio) {
    case 'descripcion':
      return productosCache.filter((producto) => normalizarTexto(producto.descripcion).includes(texto));
    case 'etiqueta':
      return productosCache.filter((producto) => normalizarTexto(producto.etiqueta).includes(texto));
    case 'codigo':
    default:
      return productosCache.filter((producto) => normalizarTexto(producto.codigoDeBarras).includes(texto));
  }
}

function attachRowActions() {
  document.querySelectorAll('[data-editar-producto]').forEach((button) => {
    button.addEventListener('click', () => editarProducto(Number(button.dataset.editarProducto)));
  });
  document.querySelectorAll('[data-eliminar-producto]').forEach((button) => {
    button.addEventListener('click', () => eliminarProducto(Number(button.dataset.eliminarProducto)));
  });
}

function renderProductos(items) {
  productosCache = items || [];
  productoBody.innerHTML = productosCache.map((producto) => `
    <tr>
      <td>${escapeHtml(producto.codigoDeBarras ?? '')}</td>
      <td>${escapeHtml(producto.descripcion ?? '')}</td>
      <td>$${escapeHtml(producto.precioVenta ?? '')}</td>
      <td>$${escapeHtml(producto.precioCompra ?? '')}</td>
      <td>${escapeHtml(producto.stock ?? '')}</td>
      <td>${escapeHtml(producto.unidadDeMedida ?? '')}</td>
      <td>${escapeHtml(producto.etiqueta ?? '')}</td>
      <td>${escapeHtml(producto.proveedorNombre ?? '')}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" data-editar-producto="${escapeHtml(producto.codigoDeBarras)}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar-producto="${escapeHtml(producto.codigoDeBarras)}">Eliminar</button>
      </td>
    </tr>
  `).join('');
  attachRowActions();
}

async function cargarProductos() {
  const response = await fetch('/api/productos', { credentials: 'include' });
  if (!response.ok) throw new Error('No se pudieron cargar los productos');
  const data = await response.json();
  renderProductos(Array.isArray(data) ? data : []);
}

async function cargarProveedores() {
  const response = await fetch('/api/proveedores', { credentials: 'include' });
  if (!response.ok) return;
  const payload = await response.json().catch(() => ({}));
  const proveedores = Array.isArray(payload?.data) ? payload.data : [];
  productoProveedor.innerHTML = '<option value="" selected disabled>Seleccione proveedor</option>' + proveedores
    .map((proveedor) => `<option value="${escapeHtml(proveedor.numeroDocumento ?? '')}">${escapeHtml(proveedor.numeroDocumento ?? '')} - ${escapeHtml(proveedor.razonSocial ?? proveedor.name ?? '')}</option>`)
    .join('');
  productoEditProveedor.innerHTML = productoProveedor.innerHTML;
}

function editarProducto(codigo) {
  const producto = productosCache.find((item) => Number(item.codigoDeBarras) === Number(codigo));
  if (!producto) return;
  abrirModalEdicionProducto(producto);
}

async function eliminarProducto(codigo) {
  if (!confirm(`¿Eliminar el producto ${codigo}?`)) return;
  const response = await fetch(`/api/productos/${codigo}`, { method: 'DELETE', credentials: 'include' });
  if (!response.ok) {
    alert('No se pudo eliminar el producto');
    return;
  }
  await cargarProductos();
}

async function buscarProductos() {
  const valor = productoBusqueda.value.trim();
  if (!valor) {
    await cargarProductos();
    return;
  }
  const criterio = productoBuscarPor?.value || 'codigo';
  renderProductos(filtrarProductosLocal(valor, criterio));
}

productoForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = formDataProducto();
  const response = await fetch('/api/productos', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    alert(payload.msg || payload.mensaje || 'No se pudo guardar el producto');
    return;
  }
  limpiarFormulario();
  await cargarProductos();
});

productoEditForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (codigoEdicionProducto === null) return;
  const body = {
    codigoDeBarras: Number(productoEditCodigo.value),
    descripcion: productoEditDescripcion.value.trim(),
    precioVenta: Number(productoEditPrecioVenta.value),
    precioCompra: Number(productoEditPrecioCompra.value),
    stock: Number(productoEditStock.value),
    unidadDeMedida: productoEditUnidad.value.trim().toUpperCase(),
    etiqueta: productoEditEtiqueta.value.trim(),
    proveedorNumeroDocumento: productoEditProveedor.value.trim(),
  };
  const response = await fetch(`/api/productos/${codigoEdicionProducto}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    alert(payload.msg || payload.mensaje || 'No se pudo actualizar el producto');
    return;
  }
  cerrarModalEdicionProducto();
  await cargarProductos();
});

document.querySelectorAll('[data-producto-close]').forEach((button) => {
  button.addEventListener('click', cerrarModalEdicionProducto);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && productoEditModal && !productoEditModal.classList.contains('d-none')) {
    cerrarModalEdicionProducto();
  }
});

productoCancelar.addEventListener('click', limpiarFormulario);
productoBuscar.addEventListener('click', buscarProductos);
productoVerTodos.addEventListener('click', cargarProductos);
document.addEventListener('DOMContentLoaded', async () => {
  await cargarProveedores();
  await cargarProductos();
});