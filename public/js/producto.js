const productoForm = document.getElementById('producto-form');
const productoSubmit = document.getElementById('producto-submit');
const productoCancelar = document.getElementById('producto-cancelar');
const productoBuscar = document.getElementById('producto-buscar');
const productoVerTodos = document.getElementById('producto-ver-todos');
const productoBody = document.getElementById('producto-body');
const productoBusqueda = document.getElementById('producto-busqueda');
const productoPorDescripcion = document.getElementById('producto-por-descripcion');

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
    proveedorId: Number(document.getElementById('producto-proveedor').value),
  };
}

function limpiarFormulario() {
  productoForm.reset();
  codigoEdicion = null;
  productoSubmit.textContent = 'Guardar producto';
  document.getElementById('producto-unidad').value = 'UNIDAD';
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
  document.getElementById('producto-proveedor').value = producto.proveedorId ?? '';
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
  const endpoint = productoPorDescripcion.checked
    ? `/api/productos/descripcion/${encodeURIComponent(valor)}`
    : `/api/productos/${encodeURIComponent(valor)}`;
  const response = await fetch(endpoint, { credentials: 'include' });
  if (!response.ok) {
    renderProductos([]);
    return;
  }
  const payload = await response.json();
  const items = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [payload];
  renderProductos(items);
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
document.addEventListener('DOMContentLoaded', cargarProductos);