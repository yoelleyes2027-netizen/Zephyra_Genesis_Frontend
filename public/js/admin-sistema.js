const usuarioForm = document.getElementById('usuario-form');
const usuarioLimpiar = document.getElementById('usuario-limpiar');
const usuariosBody = document.getElementById('usuarios-body');
const soporteHead = document.getElementById('soporte-head');
const soporteBody = document.getElementById('soporte-body');
const cargarSoporte = document.getElementById('cargar-soporte');
const tablaSoporte = document.getElementById('tabla-soporte');
const logoutBtn = document.getElementById('logout-btn');
const bddRefrescar = document.getElementById('bdd-refrescar');
const usuarioDbSelect = document.getElementById('usuario-db');
const adminSistemaMensaje = document.getElementById('admin-sistema-mensaje');
const usuarioPassword = document.getElementById('usuario-password');
const toggleUsuarioPassword = document.getElementById('toggle-usuario-password');

let usuariosCache = [];
let cedulaEdicion = null;

function mostrarMensaje(texto, tipo = 'info') {
  if (!adminSistemaMensaje) return;
  const colores = {
    info: 'text-primary',
    success: 'text-success',
    error: 'text-danger',
    warning: 'text-warning',
  };
  adminSistemaMensaje.className = `mt-3 ${colores[tipo] || colores.info}`;
  adminSistemaMensaje.textContent = texto || '';
}

if (usuarioPassword && toggleUsuarioPassword) {
  toggleUsuarioPassword.addEventListener('click', () => {
    const mostrar = usuarioPassword.type === 'password';
    usuarioPassword.type = mostrar ? 'text' : 'password';
    toggleUsuarioPassword.innerHTML = mostrar
      ? '<i class="fas fa-eye-slash"></i>'
      : '<i class="fas fa-eye"></i>';
    toggleUsuarioPassword.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
}

async function verificarRolSistema() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('No autorizado');
    const data = await response.json();
    if ((data.usuario?.rol || '').toLowerCase() !== 'admin_sistema') {
      window.location.href = './adminUsuario.html';
      return;
    }
  } catch {
    window.location.href = './login.html';
  }
}

async function cerrarSesion() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = './login.html';
}

async function cargarBasesDeDatos() {
  try {
    const selectedValue = usuarioDbSelect.value;
    usuarioDbSelect.innerHTML = '<option value="">Cargando BDD...</option>';
    const response = await fetch('/api/admin-sistema/bases-datos', { credentials: 'include' });
    if (!response.ok) throw new Error('No se pudieron cargar las BDD');
    const payload = await response.json();
    const bases = Array.isArray(payload.data) ? payload.data : [];
    usuarioDbSelect.innerHTML = '';

    if (!bases.length) {
      usuarioDbSelect.innerHTML = '<option value="">No hay bases disponibles</option>';
      return;
    }

    usuarioDbSelect.insertAdjacentHTML('beforeend', '<option value="">Seleccionar BDD...</option>');
    bases.forEach((base) => {
      const option = document.createElement('option');
      option.value = base;
      option.textContent = base;
      usuarioDbSelect.appendChild(option);
    });

    if (selectedValue && bases.includes(selectedValue)) {
      usuarioDbSelect.value = selectedValue;
    }
  } catch (error) {
    usuarioDbSelect.innerHTML = '<option value="">Error al cargar BDD</option>';
    mostrarMensaje(error.message || 'No se pudieron cargar las bases de datos', 'error');
  }
}

function limpiarFormularioUsuario() {
  usuarioForm.reset();
  document.getElementById('usuario-rol').value = 'ADMIN';
  if (usuarioDbSelect) {
    usuarioDbSelect.value = '';
  }
  cedulaEdicion = null;
  mostrarMensaje('');
}

function formDataUsuario() {
  return {
    nombre: document.getElementById('usuario-nombre').value.trim(),
    cedula: Number(document.getElementById('usuario-cedula').value),
    contraseña: document.getElementById('usuario-password').value,
    rol: document.getElementById('usuario-rol').value,
    email: document.getElementById('usuario-email').value.trim(),
    telefono: Number(document.getElementById('usuario-telefono').value || 0),
    tenantDatabase: usuarioDbSelect.value.trim(),
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
  try {
    const response = await fetch('/api/admin-sistema/usuarios', { credentials: 'include' });
    if (!response.ok) throw new Error('No se pudieron cargar los usuarios');
    const payload = await response.json();
    renderUsuarios(payload.data || []);
  } catch (error) {
    usuariosBody.innerHTML = `<tr><td colspan="7">${error.message || 'No se pudieron cargar los usuarios'}</td></tr>`;
    mostrarMensaje(error.message || 'No se pudieron cargar los usuarios', 'error');
  }
}

function editarUsuario(cedula) {
  const usuario = usuariosCache.find((item) => Number(item.cedula) === Number(cedula));
  if (!usuario) return;
  cedulaEdicion = Number(usuario.cedula);
  document.getElementById('usuario-nombre').value = usuario.nombre ?? '';
  document.getElementById('usuario-cedula').value = usuario.cedula ?? '';
  document.getElementById('usuario-password').value = '';
  document.getElementById('usuario-rol').value = (usuario.rol ?? 'ADMIN').toUpperCase();
  document.getElementById('usuario-email').value = usuario.email ?? '';
  document.getElementById('usuario-telefono').value = usuario.telefono ?? '';
  usuarioDbSelect.value = usuario.tenantDatabase ?? '';
}

async function eliminarUsuario(cedula) {
  if (!confirm(`¿Eliminar el usuario ${cedula}?`)) return;
  try {
    const response = await fetch(`/api/admin-sistema/usuarios/${cedula}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.msg || 'No se pudo eliminar el usuario');
    }
    await cargarUsuarios();
    mostrarMensaje('Usuario eliminado correctamente', 'success');
  } catch (error) {
    mostrarMensaje(error.message || 'No se pudo eliminar el usuario', 'error');
  }
}

usuarioForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = formDataUsuario();
  if (cedulaEdicion === null && !body.contraseña) {
    mostrarMensaje('La contraseña es obligatoria para crear un usuario', 'error');
    return;
  }
  if (!body.tenantDatabase) {
    mostrarMensaje('Selecciona una base de datos', 'error');
    return;
  }

  const isEdit = cedulaEdicion !== null;
  const endpoint = isEdit ? `/api/admin-sistema/usuarios/${cedulaEdicion}` : '/api/admin-sistema/usuarios';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    mostrarMensaje(isEdit ? 'Actualizando usuario...' : 'Guardando usuario...');
    const response = await fetch(endpoint, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.msg || 'No se pudo guardar el usuario');
    }
    limpiarFormularioUsuario();
    await cargarUsuarios();
    mostrarMensaje(payload.mensaje || 'Usuario guardado correctamente', 'success');
  } catch (error) {
    mostrarMensaje(error.message || 'No se pudo guardar el usuario', 'error');
  }
});

usuarioLimpiar.addEventListener('click', limpiarFormularioUsuario);
async function cargarSoporteTabla() {
  try {
    const tabla = tablaSoporte.value;
    const response = await fetch(`/api/admin-sistema/soporte?tabla=${encodeURIComponent(tabla)}`, { credentials: 'include' });
    if (!response.ok) throw new Error('No se pudo cargar la tabla');
    const payload = await response.json();
    const items = Array.isArray(payload.data?.data) ? payload.data.data : [];
    soporteHead.innerHTML = '';
    soporteBody.innerHTML = '';
    if (!items.length) {
      soporteHead.innerHTML = '<tr><th>Sin datos</th></tr>';
      soporteBody.innerHTML = '<tr><td>No hay registros para esta tabla</td></tr>';
      return;
    }
    const columns = Object.keys(items[0]);
    soporteHead.innerHTML = `<tr>${columns.map((column) => `<th>${column}</th>`).join('')}</tr>`;
    soporteBody.innerHTML = items.map((item) => `<tr>${columns.map((column) => `<td>${Array.isArray(item[column]) ? item[column].join(', ') : (item[column] ?? '')}</td>`).join('')}</tr>`).join('');
  } catch (error) {
    soporteHead.innerHTML = '<tr><th>Error</th></tr>';
    soporteBody.innerHTML = `<tr><td>${error.message || 'No se pudo cargar el soporte'}</td></tr>`;
  }
}

cargarSoporte.addEventListener('click', cargarSoporteTabla);
bddRefrescar.addEventListener('click', cargarBasesDeDatos);
logoutBtn.addEventListener('click', cerrarSesion);
document.addEventListener('DOMContentLoaded', async () => {
  await verificarRolSistema();
  await cargarBasesDeDatos();
  await cargarUsuarios();
  await cargarSoporteTabla();
});