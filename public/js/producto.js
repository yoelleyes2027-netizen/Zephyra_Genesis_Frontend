const productoForm = document.getElementById('producto-form');
const productoSubmit = document.getElementById('producto-submit');
const productoCancelar = document.getElementById('producto-cancelar');
const productoBuscar = document.getElementById('producto-buscar');
const productoVerTodos = document.getElementById('producto-ver-todos');
const productoBody = document.getElementById('producto-body');
const productoBusqueda = document.getElementById('producto-busqueda');
const productoBuscarPor = document.getElementById('producto-buscar-por');
const productoProveedor = document.getElementById('producto-proveedor');

let productosCache = [];
let codigoEdicion = null;

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
  codigoEdicion = null;
  productoSubmit.textContent = 'Guardar producto';
  document.getElementById('producto-unidad').value = 'UNIDAD';
  productoProveedor.value = '';
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
      <td>${producto.codigoDeBarras ?? ''}</td>
      <td>${producto.descripcion ?? ''}</td>
      <td>$${producto.precioVenta ?? ''}</td>
      <td>$${producto.precioCompra ?? ''}</td>
      <td>${producto.stock ?? ''}</td>
      <td>${producto.unidadDeMedida ?? ''}</td>
      <td>${producto.etiqueta ?? ''}</td>
      <td>${producto.proveedorNombre ?? ''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" data-editar-producto="${producto.codigoDeBarras}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar-producto="${producto.codigoDeBarras}">Eliminar</button>
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
    .map((proveedor) => `<option value="${proveedor.numeroDocumento ?? ''}">${proveedor.numeroDocumento ?? ''} - ${proveedor.razonSocial ?? proveedor.name ?? ''}</option>`)
    .join('');
}

function editarProducto(codigo) {
  const producto = productosCache.find((item) => Number(item.codigoDeBarras) === Number(codigo));
  if (!producto) return;
  codigoEdicion = Number(producto.codigoDeBarras);
  document.getElementById('producto-codigo').value = producto.codigoDeBarras ?? '';
  document.getElementById('producto-descripcion').value = producto.descripcion ?? '';
  document.getElementById('producto-precio-venta').value = producto.precioVenta ?? '';
  document.getElementById('producto-precio-compra').value = producto.precioCompra ?? '';
  document.getElementById('producto-stock').value = producto.stock ?? '';
  document.getElementById('producto-unidad').value = producto.unidadDeMedida ?? 'UNIDAD';
  document.getElementById('producto-etiqueta').value = producto.etiqueta ?? '';
  productoProveedor.value = producto.proveedorNumeroDocumento ?? '';
  productoSubmit.textContent = 'Actualizar producto';
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
  const isEdit = codigoEdicion !== null;
  const endpoint = isEdit ? `/api/productos/${codigoEdicion}` : '/api/productos';
  const method = isEdit ? 'PUT' : 'POST';
  const response = await fetch(endpoint, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    alert('No se pudo guardar el producto');
    return;
  }
  limpiarFormulario();
  await cargarProductos();
});

productoCancelar.addEventListener('click', limpiarFormulario);
productoBuscar.addEventListener('click', buscarProductos);
productoVerTodos.addEventListener('click', cargarProductos);
document.addEventListener('DOMContentLoaded', async () => {
  await cargarProveedores();
  await cargarProductos();
});