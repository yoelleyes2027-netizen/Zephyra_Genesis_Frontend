const empresaForm = document.getElementById('empresa-form');
const empresaSubmit = document.getElementById('empresa-submit');
const empresaCancelar = document.getElementById('empresa-cancelar');
const empresaBuscar = document.getElementById('empresa-buscar');
const empresaVerTodos = document.getElementById('empresa-ver-todos');
const empresaBody = document.getElementById('empresa-body');
const empresaBusqueda = document.getElementById('empresa-busqueda');
const empresaPorRazon = document.getElementById('empresa-por-razon');

let empresasCache = [];
let documentoEdicionEmpresa = null;

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
  documentoEdicionEmpresa = null;
  empresaSubmit.textContent = 'Guardar empresa';
  document.getElementById('empresa-tipo-documento').value = 'RUC';
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
      <td>${empresa.name ?? ''}</td>
      <td>${empresa.numeroDocumento ?? ''}</td>
      <td>${empresa.razonSocial ?? ''}</td>
      <td>${empresa.telefono ?? ''}</td>
      <td>${empresa.email ?? ''}</td>
      <td>${empresa.direccion ?? ''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" data-editar-empresa="${empresa.numeroDocumento}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar-empresa="${empresa.numeroDocumento}">Eliminar</button>
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
  documentoEdicionEmpresa = empresa.numeroDocumento;
  document.getElementById('empresa-name').value = empresa.name ?? '';
  document.getElementById('empresa-email').value = empresa.email ?? '';
  document.getElementById('empresa-telefono').value = empresa.telefono ?? '';
  document.getElementById('empresa-documento').value = empresa.numeroDocumento ?? '';
  document.getElementById('empresa-direccion').value = empresa.direccion ?? '';
  document.getElementById('empresa-razon-social').value = empresa.razonSocial ?? '';
  document.getElementById('empresa-tipo-documento').value = empresa.tipoDocumento ?? 'RUC';
  empresaSubmit.textContent = 'Actualizar empresa';
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
  const endpoint = empresaPorRazon.checked
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
  const isEdit = documentoEdicionEmpresa !== null;
  const endpoint = isEdit ? `/api/empresas/${encodeURIComponent(documentoEdicionEmpresa)}` : '/api/empresas';
  const method = isEdit ? 'PUT' : 'POST';
  const response = await fetch(endpoint, {
    method,
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

empresaCancelar.addEventListener('click', limpiarFormularioEmpresa);
empresaBuscar.addEventListener('click', buscarEmpresas);
empresaVerTodos.addEventListener('click', cargarEmpresas);
document.addEventListener('DOMContentLoaded', cargarEmpresas);