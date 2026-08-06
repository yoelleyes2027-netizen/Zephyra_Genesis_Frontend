const clienteForm = document.getElementById('cliente-form');
const clienteSubmit = document.getElementById('cliente-submit');
const clienteCancelar = document.getElementById('cliente-cancelar');
const clienteBuscar = document.getElementById('cliente-buscar');
const clienteVerTodos = document.getElementById('cliente-ver-todos');
const clienteBody = document.getElementById('cliente-body');
const clienteBusqueda = document.getElementById('cliente-busqueda');
const clientePorNombre = document.getElementById('cliente-por-nombre');
const clienteEditModal = document.getElementById('cliente-edit-modal');
const clienteEditForm = document.getElementById('cliente-edit-form');
const clienteEditName = document.getElementById('cliente-edit-name');
const clienteEditEmail = document.getElementById('cliente-edit-email');
const clienteEditTelefono = document.getElementById('cliente-edit-telefono');

let clientesCache = [];
let emailEdicionCliente = null;

function formDataCliente() {
  return {
    name: document.getElementById('cliente-name').value.trim(),
    email: document.getElementById('cliente-email').value.trim(),
    telefono: Number(document.getElementById('cliente-telefono').value || 0),
  };
}

function limpiarFormularioCliente() {
  clienteForm.reset();
}

function abrirModalEdicionCliente(cliente) {
  emailEdicionCliente = cliente.email;
  clienteEditName.value = cliente.name ?? '';
  clienteEditEmail.value = cliente.email ?? '';
  clienteEditTelefono.value = cliente.telefono ?? '';
  clienteEditModal.classList.remove('d-none');
  clienteEditModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  window.setTimeout(() => clienteEditName.focus(), 0);
}

function cerrarModalEdicionCliente() {
  emailEdicionCliente = null;
  clienteEditForm.reset();
  clienteEditModal.classList.add('d-none');
  clienteEditModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function attachClienteActions() {
  document.querySelectorAll('[data-editar-cliente]').forEach((button) => {
    button.addEventListener('click', () => editarCliente(button.dataset.editarCliente));
  });
  document.querySelectorAll('[data-eliminar-cliente]').forEach((button) => {
    button.addEventListener('click', () => eliminarCliente(button.dataset.eliminarCliente));
  });
}

function renderClientes(items) {
  clientesCache = items || [];
  clienteBody.innerHTML = clientesCache.map((cliente) => `
    <tr>
      <td>${cliente.name ?? ''}</td>
      <td>${cliente.email ?? ''}</td>
      <td>${cliente.telefono ?? ''}</td>
      <td>${cliente.fechaCreacion ?? ''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" data-editar-cliente="${cliente.email}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar-cliente="${cliente.email}">Eliminar</button>
      </td>
    </tr>
  `).join('');
  attachClienteActions();
}

function normalizarClientes(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (payload?.data) {
    return [payload.data];
  }
  return payload ? [payload] : [];
}

async function cargarClientes() {
  const response = await fetch('/api/clientes', { credentials: 'include' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.msg || 'No se pudieron cargar los clientes');
  }
  const clientes = normalizarClientes(payload);
  clientes.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  renderClientes(clientes);
}

function editarCliente(email) {
  const cliente = clientesCache.find((item) => String(item.email) === String(email));
  if (!cliente) return;
  abrirModalEdicionCliente(cliente);
}

async function eliminarCliente(email) {
  const mensajeConfirmacion = `Si eliminas este cliente, se borrará su registro.\n\n¿Deseas continuar?`;
  if (!confirm(mensajeConfirmacion)) return;

  const response = await fetch(`/api/clientes/desactivar/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    alert(payload.msg || payload.mensaje || 'No se pudo eliminar el cliente');
    return;
  }

  await cargarClientes();
}

async function buscarClientes() {
  const valor = clienteBusqueda.value.trim();
  if (!valor) {
    await cargarClientes();
    return;
  }

  const endpoint = clientePorNombre.checked
    ? `/api/clientes/buscar/denominacion/${encodeURIComponent(valor)}`
    : `/api/clientes/buscar/${encodeURIComponent(valor)}`;

  const response = await fetch(endpoint, { credentials: 'include' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    renderClientes([]);
    return;
  }

  renderClientes(normalizarClientes(payload));
}

clienteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = formDataCliente();
  const response = await fetch('/api/clientes', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    alert(payload.msg || payload.mensaje || 'No se pudo guardar el cliente');
    return;
  }

  limpiarFormularioCliente();
  await cargarClientes();
});

clienteEditForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!emailEdicionCliente) return;

  const body = {
    name: clienteEditName.value.trim(),
    email: clienteEditEmail.value.trim(),
    telefono: Number(clienteEditTelefono.value || 0),
  };

  const response = await fetch(`/api/clientes/${encodeURIComponent(emailEdicionCliente)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    alert(payload.msg || payload.mensaje || 'No se pudo actualizar el cliente');
    return;
  }

  cerrarModalEdicionCliente();
  await cargarClientes();
});

document.querySelectorAll('[data-cliente-close]').forEach((button) => {
  button.addEventListener('click', cerrarModalEdicionCliente);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && clienteEditModal && !clienteEditModal.classList.contains('d-none')) {
    cerrarModalEdicionCliente();
  }
});

clienteCancelar.addEventListener('click', limpiarFormularioCliente);
clienteBuscar.addEventListener('click', buscarClientes);
clienteVerTodos.addEventListener('click', cargarClientes);
document.addEventListener('DOMContentLoaded', cargarClientes);
