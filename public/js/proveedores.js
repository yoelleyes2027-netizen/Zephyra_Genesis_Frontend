const proveedorForm = document.getElementById('proveedor-form');
const proveedorSubmit = document.getElementById('proveedor-submit');
const proveedorCancelar = document.getElementById('proveedor-cancelar');
const proveedorBuscar = document.getElementById('proveedor-buscar');
const proveedorVerTodos = document.getElementById('proveedor-ver-todos');
const proveedorBody = document.getElementById('proveedor-body');
const proveedorBusqueda = document.getElementById('proveedor-busqueda');
const proveedorBuscarPor = document.getElementById('proveedor-buscar-por');
const proveedorEditModal = document.getElementById('proveedor-edit-modal');
const proveedorEditForm = document.getElementById('proveedor-edit-form');
const proveedorEditName = document.getElementById('proveedor-edit-name');
const proveedorEditEmail = document.getElementById('proveedor-edit-email');
const proveedorEditTelefono = document.getElementById('proveedor-edit-telefono');
const proveedorEditDocumento = document.getElementById('proveedor-edit-documento');
const proveedorEditTipoDocumento = document.getElementById('proveedor-edit-tipo-documento');
const proveedorEditRazonSocial = document.getElementById('proveedor-edit-razon-social');
const proveedorEditDireccion = document.getElementById('proveedor-edit-direccion');

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
  document.getElementById('proveedor-tipo-documento').value = 'RUT';
}

function abrirModalEdicionProveedor(proveedor) {
  documentoEdicionProveedor = proveedor.numeroDocumento;
  proveedorEditName.value = proveedor.name ?? '';
  proveedorEditEmail.value = proveedor.email ?? '';
  proveedorEditTelefono.value = proveedor.telefono ?? '';
  proveedorEditDocumento.value = proveedor.numeroDocumento ?? '';
  proveedorEditTipoDocumento.value = proveedor.tipoDocumento ?? 'RUT';
  proveedorEditRazonSocial.value = proveedor.razonSocial ?? '';
  proveedorEditDireccion.value = proveedor.direccion ?? '';
  proveedorEditModal.classList.remove('d-none');
  proveedorEditModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  window.setTimeout(() => proveedorEditName.focus(), 0);
}

function cerrarModalEdicionProveedor() {
  documentoEdicionProveedor = null;
  proveedorEditForm.reset();
  proveedorEditModal.classList.add('d-none');
  proveedorEditModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
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
  abrirModalEdicionProveedor(proveedor);
}

async function eliminarProveedor(documento) {
  const mensajeConfirmacion = `Si eliminas este proveedor, se eliminarán todos los productos asociados.\n\n¿Deseas continuar?`;
  if (!confirm(mensajeConfirmacion)) return;
  const response = await fetch(`/api/proveedores/desactivar/${encodeURIComponent(documento)}`, { method: 'DELETE', credentials: 'include' });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    alert(payload.msg || payload.mensaje || 'No se pudo eliminar el proveedor');
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
  const response = await fetch('/api/proveedores', {
    method: 'POST',
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

proveedorEditForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!documentoEdicionProveedor) return;
  const body = {
    name: proveedorEditName.value.trim(),
    email: proveedorEditEmail.value.trim(),
    telefono: Number(proveedorEditTelefono.value || 0),
    numeroDocumento: proveedorEditDocumento.value.trim(),
    numero_documento: proveedorEditDocumento.value.trim(),
    direccion: proveedorEditDireccion.value.trim(),
    razonSocial: proveedorEditRazonSocial.value.trim(),
    tipoDocumento: proveedorEditTipoDocumento.value.trim().toUpperCase(),
  };
  const response = await fetch(`/api/proveedores/${encodeURIComponent(documentoEdicionProveedor)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    alert(payload.msg || payload.mensaje || 'No se pudo actualizar el proveedor');
    return;
  }
  cerrarModalEdicionProveedor();
  await cargarProveedores();
});

document.querySelectorAll('[data-proveedor-close]').forEach((button) => {
  button.addEventListener('click', cerrarModalEdicionProveedor);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && proveedorEditModal && !proveedorEditModal.classList.contains('d-none')) {
    cerrarModalEdicionProveedor();
  }
});

proveedorCancelar.addEventListener('click', limpiarFormularioProveedor);
proveedorBuscar.addEventListener('click', buscarProveedores);
proveedorVerTodos.addEventListener('click', cargarProveedores);
document.addEventListener('DOMContentLoaded', cargarProveedores);