const empresaForm = document.getElementById('empresa-form');
const empresaSubmit = document.getElementById('empresa-submit');
const empresaCancelar = document.getElementById('empresa-cancelar');
const empresaBuscar = document.getElementById('empresa-buscar');
const empresaVerTodos = document.getElementById('empresa-ver-todos');
const empresaBody = document.getElementById('empresa-body');
const empresaBusqueda = document.getElementById('empresa-busqueda');
const empresaBuscarPor = document.getElementById('empresa-buscar-por');
const empresaEditModal = document.getElementById('empresa-edit-modal');
const empresaEditForm = document.getElementById('empresa-edit-form');
const empresaEditName = document.getElementById('empresa-edit-name');
const empresaEditEmail = document.getElementById('empresa-edit-email');
const empresaEditTelefono = document.getElementById('empresa-edit-telefono');
const empresaEditDocumento = document.getElementById('empresa-edit-documento');
const empresaEditTipoDocumento = document.getElementById('empresa-edit-tipo-documento');
const empresaEditRazonSocial = document.getElementById('empresa-edit-razon-social');
const empresaEditDireccion = document.getElementById('empresa-edit-direccion');

let empresasCache = [];
let documentoEdicionEmpresa = null;

function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formDataEmpresa() {
  return {
    name: document.getElementById('empresa-name').value.trim(),
    email: document.getElementById('empresa-email').value.trim(),
    telefono: Number(document.getElementById('empresa-telefono').value || 0),
    razonSocial: document.getElementById('empresa-razon-social').value.trim(),
    tipoDocumento: document.getElementById('empresa-tipo-documento').value.trim().toUpperCase(),
    direccion: document.getElementById('empresa-direccion').value.trim(),
    numeroDocumento: document.getElementById('empresa-documento').value.trim(),
  };
}

function limpiarFormularioEmpresa() {
  empresaForm.reset();
  empresaSubmit.textContent = 'Guardar empresa';
  document.getElementById('empresa-tipo-documento').value = 'RUT';
}

function abrirModalEdicionEmpresa(empresa) {
  documentoEdicionEmpresa = empresa.numeroDocumento;
  empresaEditName.value = empresa.name ?? '';
  empresaEditEmail.value = empresa.email ?? '';
  empresaEditTelefono.value = empresa.telefono ?? '';
  empresaEditDocumento.value = empresa.numeroDocumento ?? '';
  empresaEditTipoDocumento.value = empresa.tipoDocumento ?? 'RUT';
  empresaEditRazonSocial.value = empresa.razonSocial ?? '';
  empresaEditDireccion.value = empresa.direccion ?? '';
  empresaEditModal.classList.remove('d-none');
  empresaEditModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  window.setTimeout(() => empresaEditName.focus(), 0);
}

function cerrarModalEdicionEmpresa() {
  documentoEdicionEmpresa = null;
  empresaEditForm.reset();
  empresaEditModal.classList.add('d-none');
  empresaEditModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function attachEmpresaActions() {
  document.querySelectorAll('[data-editar-empresa]').forEach((button) => {
    button.addEventListener('click', () => editarEmpresa(button.dataset.editarEmpresa));
  });
  document.querySelectorAll('[data-eliminar-empresa]').forEach((button) => {
    button.addEventListener('click', () => eliminarEmpresa(button.dataset.eliminarEmpresa));
  });
}

function renderEmpresas(items) {
  empresasCache = items || [];
  empresaBody.innerHTML = empresasCache.map((empresa) => `
    <tr>
      <td>${escapeHtml(empresa.name ?? '')}</td>
      <td>${escapeHtml(empresa.numeroDocumento ?? '')}</td>
      <td>${escapeHtml(empresa.razonSocial ?? '')}</td>
      <td>${escapeHtml(empresa.telefono ?? '')}</td>
      <td>${escapeHtml(empresa.email ?? '')}</td>
      <td>${escapeHtml(empresa.direccion ?? '')}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" data-editar-empresa="${escapeHtml(empresa.numeroDocumento)}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar-empresa="${escapeHtml(empresa.numeroDocumento)}">Eliminar</button>
      </td>
    </tr>
  `).join('');
  attachEmpresaActions();
}

async function cargarEmpresas() {
  const response = await fetch('/api/empresas', { credentials: 'include' });
  if (!response.ok) throw new Error('No se pudieron cargar las empresas');
  const data = await response.json();
  renderEmpresas(Array.isArray(data) ? data : []);
}

function editarEmpresa(documento) {
  const empresa = empresasCache.find((item) => String(item.numeroDocumento) === String(documento));
  if (!empresa) return;
  abrirModalEdicionEmpresa(empresa);
}

async function eliminarEmpresa(documento) {
  if (!confirm(`¿Eliminar la empresa ${documento}?`)) return;
  const response = await fetch(`/api/empresas/desactivar/${encodeURIComponent(documento)}`, { method: 'DELETE', credentials: 'include' });
  if (!response.ok) {
    alert('No se pudo eliminar la empresa');
    return;
  }
  await cargarEmpresas();
}

async function buscarEmpresas() {
  const valor = empresaBusqueda.value.trim();
  if (!valor) {
    await cargarEmpresas();
    return;
  }
  const endpoint = empresaBuscarPor.value === 'razon'
    ? `/api/empresas/buscar/denominacion/${encodeURIComponent(valor)}`
    : `/api/empresas/buscar/${encodeURIComponent(valor)}`;
  const response = await fetch(endpoint, { credentials: 'include' });
  if (!response.ok) {
    renderEmpresas([]);
    return;
  }
  const payload = await response.json();
  const items = Array.isArray(payload.data) ? payload.data : [payload.data];
  renderEmpresas(items);
}

empresaForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = formDataEmpresa();
  const response = await fetch('/api/empresas', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    alert('No se pudo guardar la empresa');
    return;
  }
  limpiarFormularioEmpresa();
  await cargarEmpresas();
});

empresaEditForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!documentoEdicionEmpresa) return;
  const body = {
    name: empresaEditName.value.trim(),
    email: empresaEditEmail.value.trim(),
    telefono: Number(empresaEditTelefono.value || 0),
    numeroDocumento: empresaEditDocumento.value.trim(),
    direccion: empresaEditDireccion.value.trim(),
    razonSocial: empresaEditRazonSocial.value.trim(),
    tipoDocumento: empresaEditTipoDocumento.value.trim().toUpperCase(),
  };
  const response = await fetch(`/api/empresas/${encodeURIComponent(documentoEdicionEmpresa)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    alert('No se pudo actualizar la empresa');
    return;
  }
  cerrarModalEdicionEmpresa();
  await cargarEmpresas();
});

document.querySelectorAll('[data-empresa-close]').forEach((button) => {
  button.addEventListener('click', cerrarModalEdicionEmpresa);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && empresaEditModal && !empresaEditModal.classList.contains('d-none')) {
    cerrarModalEdicionEmpresa();
  }
});

empresaCancelar.addEventListener('click', limpiarFormularioEmpresa);
empresaBuscar.addEventListener('click', buscarEmpresas);
empresaVerTodos.addEventListener('click', cargarEmpresas);
document.addEventListener('DOMContentLoaded', cargarEmpresas);