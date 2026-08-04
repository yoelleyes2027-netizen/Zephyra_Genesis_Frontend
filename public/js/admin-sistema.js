const usuarioForm = document.getElementById('usuario-form');
const usuarioLimpiar = document.getElementById('usuario-limpiar');
const usuariosBody = document.getElementById('usuarios-body');
const soporteHead = document.getElementById('soporte-head');
const soporteBody = document.getElementById('soporte-body');
const cargarSoporte = document.getElementById('cargar-soporte');
const tablaSoporte = document.getElementById('tabla-soporte');
const logoutBtn = document.getElementById('logout-btn');

let usuariosCache = [];
let cedulaEdicion = null;

async function verificarRolSistema() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('No autorizado');
    const data = await response.json();
    if ((data.usuario?.rol || '').toLowerCase() !== 'admin_sistema') {
      window.location.href = './adminUsuario.html';
    }
  } catch {
    window.location.href = './login.html';
  }
}

async function cerrarSesion() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = './login.html';
}

function limpiarFormularioUsuario() {
  usuarioForm.reset();
  document.getElementById('usuario-rol').value = 'ADMIN_SISTEMA';
  cedulaEdicion = null;
}

function formDataUsuario() {
  return {
    nombre: document.getElementById('usuario-nombre').value.trim(),
    cedula: Number(document.getElementById('usuario-cedula').value),
    contraseña: document.getElementById('usuario-password').value,
    rol: document.getElementById('usuario-rol').value,
    email: document.getElementById('usuario-email').value.trim(),
    telefono: Number(document.getElementById('usuario-telefono').value || 0),
    tenantDatabase: document.getElementById('usuario-db').value.trim(),
  };
}

function attachUsuarioActions() {
  document.querySelectorAll('[data-editar-usuario]').forEach((button) => {
    button.addEventListener('click', () => editarUsuario(Number(button.dataset.editarUsuario)));
  });
  document.querySelectorAll('[data-eliminar-usuario]').forEach((button) => {
    button.addEventListener('click', () => eliminarUsuario(Number(button.dataset.eliminarUsuario)));
  });
}

function renderUsuarios(items) {
  usuariosCache = items || [];
  usuariosBody.innerHTML = usuariosCache.map((usuario) => `
    <tr>
      <td>${usuario.nombre ?? ''}</td>
      <td>${usuario.cedula ?? ''}</td>
      <td>${usuario.rol ?? ''}</td>
      <td>${usuario.tenantDatabase ?? ''}</td>
      <td>${usuario.email ?? ''}</td>
      <td>${usuario.telefono ?? ''}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-2" data-editar-usuario="${usuario.cedula}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-eliminar-usuario="${usuario.cedula}">Eliminar</button>
      </td>
    </tr>
  `).join('');
  attachUsuarioActions();
}

async function cargarUsuarios() {
  const response = await fetch('/api/admin-sistema/usuarios', { credentials: 'include' });
  const payload = await response.json();
  renderUsuarios(payload.data || []);
}

function editarUsuario(cedula) {
  const usuario = usuariosCache.find((item) => Number(item.cedula) === Number(cedula));
  if (!usuario) return;
  cedulaEdicion = Number(usuario.cedula);
  document.getElementById('usuario-nombre').value = usuario.nombre ?? '';
  document.getElementById('usuario-cedula').value = usuario.cedula ?? '';
  document.getElementById('usuario-password').value = '';
  document.getElementById('usuario-rol').value = (usuario.rol ?? 'ADMIN_SISTEMA').toUpperCase();
  document.getElementById('usuario-email').value = usuario.email ?? '';
  document.getElementById('usuario-telefono').value = usuario.telefono ?? '';
  document.getElementById('usuario-db').value = usuario.tenantDatabase ?? '';
}

async function eliminarUsuario(cedula) {
  if (!confirm(`¿Eliminar el usuario ${cedula}?`)) return;
  const response = await fetch(`/api/admin-sistema/usuarios/${cedula}`, { method: 'DELETE', credentials: 'include' });
  if (!response.ok) {
    alert('No se pudo eliminar el usuario');
    return;
  }
  await cargarUsuarios();
}

usuarioForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = formDataUsuario();
  if (cedulaEdicion === null && !body.contraseña) {
    alert('La contraseña es obligatoria para crear un usuario');
    return;
  }
  const isEdit = cedulaEdicion !== null;
  const endpoint = isEdit ? `/api/admin-sistema/usuarios/${cedulaEdicion}` : '/api/admin-sistema/usuarios';
  const method = isEdit ? 'PUT' : 'POST';
  const response = await fetch(endpoint, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    alert('No se pudo guardar el usuario');
    return;
  }
  limpiarFormularioUsuario();
  await cargarUsuarios();
});

usuarioLimpiar.addEventListener('click', limpiarFormularioUsuario);
async function cargarSoporteTabla() {
  const tabla = tablaSoporte.value;
  const response = await fetch(`/api/admin-sistema/soporte?tabla=${encodeURIComponent(tabla)}`, { credentials: 'include' });
  const payload = await response.json();
  const items = payload.data?.data || [];
  soporteHead.innerHTML = '';
  soporteBody.innerHTML = '';
  if (!items.length) {
    soporteHead.innerHTML = '<tr><th>Sin datos</th></tr>';
    return;
  }
  const columns = Object.keys(items[0]);
  soporteHead.innerHTML = `<tr>${columns.map((column) => `<th>${column}</th>`).join('')}</tr>`;
  soporteBody.innerHTML = items.map((item) => `<tr>${columns.map((column) => `<td>${Array.isArray(item[column]) ? item[column].join(', ') : (item[column] ?? '')}</td>`).join('')}</tr>`).join('');
}

cargarSoporte.addEventListener('click', cargarSoporteTabla);
logoutBtn.addEventListener('click', cerrarSesion);
document.addEventListener('DOMContentLoaded', async () => {
  await verificarRolSistema();
  await cargarUsuarios();
  await cargarSoporteTabla();
});