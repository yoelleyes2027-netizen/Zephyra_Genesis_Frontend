const proveedorForm = document.getElementById('proveedor-form');
const proveedorSubmit = document.getElementById('proveedor-submit');
const proveedorCancelar = document.getElementById('proveedor-cancelar');
const proveedorBuscar = document.getElementById('proveedor-buscar');
const proveedorVerTodos = document.getElementById('proveedor-ver-todos');
const proveedorBody = document.getElementById('proveedor-body');
const proveedorBusqueda = document.getElementById('proveedor-busqueda');
const proveedorBuscarPor = document.getElementById('proveedor-buscar-por');

let proveedoresCache = [];
let documentoEdicionProveedor = null;

function formDataProveedor() {
  const numeroDocumento = document.getElementById('proveedor-documento').value.trim();
  return {
    name: document.getElementById('proveedor-name').value.trim(),
    email: document.getElementById('proveedor-email').value.trim(),
    telefono: Number(document.getElementById('proveedor-telefono').value || 0),
    numeroDocumento,
    numero_documento: numeroDocumento,
    direccion: document.getElementById('proveedor-direccion').value.trim(),
    razonSocial: document.getElementById('proveedor-razon-social').value.trim(),
    tipoDocumento: document.getElementById('proveedor-tipo-documento').value.trim().toUpperCase(),
  };
}

function limpiarFormularioProveedor() {
  proveedorForm.reset();
  documentoEdicionProveedor = null;
  proveedorSubmit.textContent = 'Guardar proveedor';
  document.getElementById('proveedor-tipo-documento').value = 'RUC';
}

function attachProveedorActions() {
  document.querySelectorAll('[data-editar-proveedor]').forEach((button) => {
    button.addEventListener('click', () => editarProveedor(button.dataset.editarProveedor));
  });
  document.querySelectorAll('[data-eliminar-proveedor]').forEach((button) => {
    button.addEventListener('click', () => eliminarProveedor(button.dataset.eliminarProveedor));
  });
}

function renderProveedores(items) {
  proveedoresCache = items || [];
  proveedorBody.innerHTML = proveedoresCache.map((proveedor) => `
    <tr>
      <td>${proveedor.name ?? ''}</td>
      <td>${proveedor.numeroDocumento ?? ''}</td>
      <td>${proveedor.razonSocial ?? ''}</td>
      <td>${proveedor.telefono ?? ''}</td>
      <td>${proveedor.email ?? ''}</td>
      <td>${proveedor.direccion ?? ''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" data-editar-proveedor="${proveedor.numeroDocumento}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar-proveedor="${proveedor.numeroDocumento}">Eliminar</button>
      </td>
    </tr>
  `).join('');
  attachProveedorActions();
}

async function cargarProveedores() {
  const response = await fetch('/api/proveedores', { credentials: 'include' });
  if (!response.ok) throw new Error('No se pudieron cargar los proveedores');
  const payload = await response.json();
  renderProveedores(payload.data || []);
}

function editarProveedor(documento) {
  const proveedor = proveedoresCache.find((item) => String(item.numeroDocumento) === String(documento));
  if (!proveedor) return;
  documentoEdicionProveedor = proveedor.numeroDocumento;
  document.getElementById('proveedor-name').value = proveedor.name ?? '';
  document.getElementById('proveedor-email').value = proveedor.email ?? '';
  document.getElementById('proveedor-telefono').value = proveedor.telefono ?? '';
  document.getElementById('proveedor-documento').value = proveedor.numeroDocumento ?? '';
  document.getElementById('proveedor-direccion').value = proveedor.direccion ?? '';
  document.getElementById('proveedor-razon-social').value = proveedor.razonSocial ?? '';
  document.getElementById('proveedor-tipo-documento').value = proveedor.tipoDocumento ?? 'RUC';
  proveedorSubmit.textContent = 'Actualizar proveedor';
}

async function eliminarProveedor(documento) {
  if (!confirm(`¿Eliminar el proveedor ${documento}?`)) return;
  const response = await fetch(`/api/proveedores/desactivar/${encodeURIComponent(documento)}`, { method: 'DELETE', credentials: 'include' });
  if (!response.ok) {
    alert('No se pudo eliminar el proveedor');
    return;
  }
  await cargarProveedores();
}

async function buscarProveedores() {
  const valor = proveedorBusqueda.value.trim();
  if (!valor) {
    await cargarProveedores();
    return;
  }
  const criterio = proveedorBuscarPor?.value || 'documento';
  const endpoint = criterio === 'razon'
    ? `/api/proveedores/buscar/denominacion/${encodeURIComponent(valor)}`
    : `/api/proveedores/buscar/${encodeURIComponent(valor)}`;
  const response = await fetch(endpoint, { credentials: 'include' });
  if (!response.ok) {
    renderProveedores([]);
    return;
  }
  const payload = await response.json();
  const items = Array.isArray(payload.data) ? payload.data : [payload.data];
  renderProveedores(items);
}

proveedorForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = formDataProveedor();
  const isEdit = documentoEdicionProveedor !== null;
  const endpoint = isEdit ? `/api/proveedores/${encodeURIComponent(documentoEdicionProveedor)}` : '/api/proveedores';
  const method = isEdit ? 'PUT' : 'POST';
  const response = await fetch(endpoint, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    alert(payload.msg || payload.mensaje || 'No se pudo guardar el proveedor');
    return;
  }
  limpiarFormularioProveedor();
  await cargarProveedores();
});

proveedorCancelar.addEventListener('click', limpiarFormularioProveedor);
proveedorBuscar.addEventListener('click', buscarProveedores);
proveedorVerTodos.addEventListener('click', cargarProveedores);
document.addEventListener('DOMContentLoaded', cargarProveedores);