const usuarioForm = document.getElementById('usuario-form');
const soporteHead = document.getElementById('soporte-head');
const soporteBody = document.getElementById('soporte-body');
const cargarSoporte = document.getElementById('cargar-soporte');
const tablaSoporte = document.getElementById('tabla-soporte');
const logoutBtn = document.getElementById('logout-btn');
const usuarioDbSelect = document.getElementById('usuario-db');
const adminSistemaMensaje = document.getElementById('admin-sistema-mensaje');
const usuarioPassword = document.getElementById('usuario-password');
const toggleUsuarioPassword = document.getElementById('toggle-usuario-password');

let soporteItemsCache = [];
let tablaSoporteActual = 'usuarios';

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

function mostrarMensajeError(error) {
  mostrarMensaje(error?.message || 'Ocurrió un error', 'error');
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

soporteBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-accion-soporte]');
  if (!button) return;
  await manejarAccionSoporte(tablaSoporteActual, button.dataset.accionSoporte, button.dataset.claveSoporte);
});

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
    mostrarMensajeError(error);
  }
}

function limpiarFormularioUsuario() {
  usuarioForm.reset();
  document.getElementById('usuario-rol').value = '';
  if (usuarioDbSelect) {
    usuarioDbSelect.value = '';
  }
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

function pedirTexto(titulo, valorActual = '', obligatorio = false) {
  const respuesta = window.prompt(titulo, valorActual ?? '');
  if (respuesta === null) {
    return null;
  }
  const limpio = respuesta.trim();
  if (obligatorio && !limpio) {
    mostrarMensaje('Debe completar todos los campos requeridos', 'error');
    return undefined;
  }
  return limpio;
}

function pedirNumero(titulo, valorActual = '', obligatorio = false) {
  const respuesta = window.prompt(titulo, valorActual === null || valorActual === undefined ? '' : String(valorActual));
  if (respuesta === null) {
    return null;
  }
  const limpio = respuesta.trim();
  if (!limpio) {
    if (obligatorio) {
      mostrarMensaje('Debe completar todos los campos requeridos', 'error');
      return undefined;
    }
    return 0;
  }
  const numero = Number(limpio);
  if (Number.isNaN(numero)) {
    mostrarMensaje('Debe ingresar un número válido', 'error');
    return undefined;
  }
  return numero;
}

function pedirUnidadMedida(valorActual = '') {
  const respuesta = window.prompt('Unidad de medida (KILOGRAMO, LITRO, UNIDAD)', valorActual ?? 'UNIDAD');
  if (respuesta === null) {
    return null;
  }
  const limpio = respuesta.trim().toUpperCase();
  if (!['KILOGRAMO', 'LITRO', 'UNIDAD'].includes(limpio)) {
    mostrarMensaje('Unidad de medida inválida', 'error');
    return undefined;
  }
  return limpio;
}

function obtenerClaveSoporte(tabla, item) {
  switch (tabla) {
    case 'usuarios':
    case 'usuario':
      return String(item.cedula ?? item.id ?? '');
    case 'proveedores':
    case 'proveedor':
    case 'empresas':
    case 'empresa':
      return String(item.numeroDocumento ?? item.id ?? '');
    case 'productos':
    case 'producto':
      return String(item.codigoDeBarras ?? item.id ?? '');
    case 'tickets':
    case 'ticket':
    case 'detalle_ticket':
    case 'detalle-ticket':
    case 'detalleticket':
    case 'caja_diaria':
    case 'caja-diaria':
    case 'cajadiaria':
      return String(item.id ?? '');
    default:
      return String(item.id ?? '');
  }
}

function encontrarItemSoporte(tabla, clave) {
  return soporteItemsCache.find((item) => obtenerClaveSoporte(tabla, item) === String(clave));
}

function accionesSoporteHtml(tabla, item) {
  const clave = obtenerClaveSoporte(tabla, item);
  if (!clave) {
    return '<button class="btn btn-sm btn-outline-secondary" type="button" disabled>Sin acciones</button>';
  }

  const accionesEdicion = new Set(['usuarios', 'usuario', 'proveedores', 'proveedor', 'empresas', 'empresa', 'productos', 'producto']);
  if (accionesEdicion.has(tabla)) {
    return `
      <button class="btn btn-sm btn-outline-primary me-2" type="button" data-accion-soporte="editar" data-clave-soporte="${clave}">Editar</button>
      <button class="btn btn-sm btn-outline-danger" type="button" data-accion-soporte="eliminar" data-clave-soporte="${clave}">Eliminar</button>
    `;
  }

  if (tabla === 'tickets' || tabla === 'ticket') {
    return `<button class="btn btn-sm btn-outline-danger" type="button" data-accion-soporte="desactivar" data-clave-soporte="${clave}">Desactivar</button>`;
  }

  if (tabla === 'detalle_ticket' || tabla === 'detalle-ticket' || tabla === 'detalleticket') {
    return `<button class="btn btn-sm btn-outline-danger" type="button" data-accion-soporte="eliminar-articulos" data-clave-soporte="${clave}">Eliminar artículos</button>`;
  }

  return '<button class="btn btn-sm btn-outline-secondary" type="button" disabled>Sin acciones</button>';
}

function renderSoporteTabla(items) {
  soporteItemsCache = items || [];
  if (!soporteItemsCache.length) {
    soporteHead.innerHTML = '<tr><th>Sin datos</th></tr>';
    soporteBody.innerHTML = '<tr><td>No hay registros para esta tabla</td></tr>';
    return;
  }

  const columns = Object.keys(soporteItemsCache[0]);
  soporteHead.innerHTML = `<tr>${columns.map((column) => `<th>${column}</th>`).join('')}<th>Acciones</th></tr>`;
  soporteBody.innerHTML = soporteItemsCache.map((item) => {
    const celdas = columns.map((column) => `<td>${Array.isArray(item[column]) ? item[column].join(', ') : (item[column] ?? '')}</td>`).join('');
    return `<tr>${celdas}<td>${accionesSoporteHtml(tablaSoporteActual, item)}</td></tr>`;
  }).join('');
}

async function cargarSoporteTabla() {
  try {
    tablaSoporteActual = tablaSoporte.value;
    const response = await fetch(`/api/admin-sistema/soporte?tabla=${encodeURIComponent(tablaSoporteActual)}`, { credentials: 'include' });
    if (!response.ok) throw new Error('No se pudo cargar la tabla');
    const payload = await response.json();
    const items = Array.isArray(payload.data?.data) ? payload.data.data : [];
    renderSoporteTabla(items);
  } catch (error) {
    soporteHead.innerHTML = '<tr><th>Error</th></tr>';
    soporteBody.innerHTML = `<tr><td>${error.message || 'No se pudo cargar el soporte'}</td></tr>`;
  }
}

async function guardarUsuarioNuevo() {
  const body = formDataUsuario();
  if (!body.rol) {
    mostrarMensaje('Debe seleccionar un rol', 'error');
    return;
  }
  if (!body.contraseña) {
    mostrarMensaje('La contraseña es obligatoria para crear un usuario', 'error');
    return;
  }
  if (!body.tenantDatabase) {
    mostrarMensaje('Selecciona una base de datos', 'error');
    return;
  }

  try {
    mostrarMensaje('Guardando usuario...');
    const response = await fetch('/api/admin-sistema/usuarios', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.msg || 'No se pudo guardar el usuario');
    }
    limpiarFormularioUsuario();
    await cargarSoporteTabla();
    mostrarMensaje(payload.mensaje || 'Usuario guardado correctamente', 'success');
  } catch (error) {
    mostrarMensaje(error.message || 'No se pudo guardar el usuario', 'error');
  }
}

async function manejarAccionSoporte(tabla, accion, clave) {
  const item = encontrarItemSoporte(tabla, clave);
  if (!item) {
    mostrarMensaje('No se encontró el registro seleccionado', 'error');
    return;
  }

  try {
    if (accion === 'editar') {
      await editarItemSoporte(tabla, item);
      return;
    }

    if (accion === 'eliminar') {
      await eliminarItemSoporte(tabla, item);
      return;
    }

    if (accion === 'desactivar') {
      await desactivarTicket(item);
      return;
    }

    if (accion === 'eliminar-articulos') {
      await eliminarArticulosDetalle(item);
      return;
    }

    mostrarMensaje('Acción no soportada', 'error');
  } catch (error) {
    mostrarMensaje(error.message || 'No se pudo completar la acción', 'error');
  }
}

async function editarItemSoporte(tabla, item) {
  switch (tabla) {
    case 'usuarios':
    case 'usuario':
      await editarUsuarioSoporte(item);
      break;
    case 'proveedores':
    case 'proveedor':
      await editarProveedorSoporte(item);
      break;
    case 'empresas':
    case 'empresa':
      await editarEmpresaSoporte(item);
      break;
    case 'productos':
    case 'producto':
      await editarProductoSoporte(item);
      break;
    default:
      throw new Error('La edición no está disponible para esta tabla.');
  }
}

async function eliminarItemSoporte(tabla, item) {
  switch (tabla) {
    case 'usuarios':
    case 'usuario':
      if (!window.confirm(`¿Eliminar el usuario ${item.cedula}?`)) return;
      await fetchApi('/api/admin-sistema/usuarios/' + encodeURIComponent(item.cedula), { method: 'DELETE' });
      mostrarMensaje('Usuario eliminado correctamente', 'success');
      break;
    case 'proveedores':
    case 'proveedor':
      if (!window.confirm(`¿Eliminar el proveedor ${item.numeroDocumento}?`)) return;
      await fetchApi('/api/proveedores/desactivar/' + encodeURIComponent(item.numeroDocumento), { method: 'DELETE' });
      mostrarMensaje('Proveedor eliminado correctamente', 'success');
      break;
    case 'empresas':
    case 'empresa':
      if (!window.confirm(`¿Eliminar la empresa ${item.numeroDocumento}?`)) return;
      await fetchApi('/api/empresas/desactivar/' + encodeURIComponent(item.numeroDocumento), { method: 'DELETE' });
      mostrarMensaje('Empresa eliminada correctamente', 'success');
      break;
    case 'productos':
    case 'producto':
      if (!window.confirm(`¿Eliminar el producto ${item.codigoDeBarras}?`)) return;
      await fetchApi('/api/productos/' + encodeURIComponent(item.codigoDeBarras), { method: 'DELETE' });
      mostrarMensaje('Producto eliminado correctamente', 'success');
      break;
    default:
      throw new Error('La eliminación no está disponible para esta tabla.');
  }

  await cargarSoporteTabla();
}

async function desactivarTicket(item) {
  if (!window.confirm(`¿Desactivar el ticket ${item.id}?`)) return;
  await fetchApi('/api/tickets/desactivar', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket_id: Number(item.id) }),
  });
  mostrarMensaje('Ticket desactivado correctamente', 'success');
  await cargarSoporteTabla();
}

async function eliminarArticulosDetalle(item) {
  if (!window.confirm(`¿Eliminar el detalle ${item.id}?`)) return;
  await fetchApi('/api/tickets/eliminar-articulos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ detalles_ids: [Number(item.id)] }),
  });
  mostrarMensaje('Detalle eliminado correctamente', 'success');
  await cargarSoporteTabla();
}

async function editarUsuarioSoporte(item) {
  const nombre = pedirTexto('Nombre completo', item.nombre ?? '', true);
  if (nombre === null || nombre === undefined) return;

  const cedula = pedirNumero('Cédula', item.cedula ?? '', true);
  if (cedula === null || cedula === undefined) return;

  const contraseña = window.prompt('Contraseña (dejar vacío para no cambiarla)', '');
  if (contraseña === null) return;

  const rol = pedirTexto('Rol (ADMIN, RECEPCION o CAJERO)', (item.rol ?? '').toUpperCase(), true);
  if (rol === null || rol === undefined) return;

  const email = pedirTexto('Email', item.email ?? '', false);
  if (email === null || email === undefined) return;

  const telefono = pedirNumero('Teléfono', item.telefono ?? '', false);
  if (telefono === null || telefono === undefined) return;

  const tenantDatabase = pedirTexto('Base de datos asignada', item.tenantDatabase ?? '', true);
  if (tenantDatabase === null || tenantDatabase === undefined) return;

  await fetchApi('/api/admin-sistema/usuarios/' + encodeURIComponent(item.cedula), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre,
      cedula,
      contraseña: contraseña.trim(),
      rol,
      email,
      telefono,
      tenantDatabase,
    }),
  });

  mostrarMensaje('Usuario actualizado correctamente', 'success');
  await cargarSoporteTabla();
}

async function editarProveedorSoporte(item) {
  const name = pedirTexto('Nombre', item.name ?? '', true);
  if (name === null || name === undefined) return;

  const email = pedirTexto('Email', item.email ?? '', false);
  if (email === null || email === undefined) return;

  const telefono = pedirNumero('Teléfono', item.telefono ?? '', false);
  if (telefono === null || telefono === undefined) return;

  const numeroDocumento = pedirTexto('Número de documento', item.numeroDocumento ?? '', true);
  if (numeroDocumento === null || numeroDocumento === undefined) return;

  const direccion = pedirTexto('Dirección', item.direccion ?? '', false);
  if (direccion === null || direccion === undefined) return;

  const razonSocial = pedirTexto('Razón social', item.razonSocial ?? '', true);
  if (razonSocial === null || razonSocial === undefined) return;

  const tipoDocumento = pedirTexto('Tipo de documento (CI, RUT, RUC)', item.tipoDocumento ?? 'CI', false);
  if (tipoDocumento === null || tipoDocumento === undefined) return;

  await fetchApi('/api/proveedores/' + encodeURIComponent(item.numeroDocumento), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      telefono,
      numeroDocumento,
      direccion,
      razonSocial,
      tipoDocumento,
    }),
  });

  mostrarMensaje('Proveedor actualizado correctamente', 'success');
  await cargarSoporteTabla();
}

async function editarEmpresaSoporte(item) {
  const name = pedirTexto('Nombre', item.name ?? '', true);
  if (name === null || name === undefined) return;

  const email = pedirTexto('Email', item.email ?? '', false);
  if (email === null || email === undefined) return;

  const telefono = pedirNumero('Teléfono', item.telefono ?? '', false);
  if (telefono === null || telefono === undefined) return;

  const razonSocial = pedirTexto('Razón social', item.razonSocial ?? '', true);
  if (razonSocial === null || razonSocial === undefined) return;

  const tipoDocumento = pedirTexto('Tipo de documento', item.tipoDocumento ?? '', true);
  if (tipoDocumento === null || tipoDocumento === undefined) return;

  const direccion = pedirTexto('Dirección', item.direccion ?? '', false);
  if (direccion === null || direccion === undefined) return;

  const numeroDocumento = pedirTexto('Número de documento', item.numeroDocumento ?? '', true);
  if (numeroDocumento === null || numeroDocumento === undefined) return;

  await fetchApi('/api/empresas/' + encodeURIComponent(item.numeroDocumento), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      telefono,
      razonSocial,
      tipoDocumento,
      direccion,
      numeroDocumento,
    }),
  });

  mostrarMensaje('Empresa actualizada correctamente', 'success');
  await cargarSoporteTabla();
}

async function editarProductoSoporte(item) {
  const descripcion = pedirTexto('Descripción', item.descripcion ?? '', true);
  if (descripcion === null || descripcion === undefined) return;

  const precioVenta = pedirNumero('Precio de venta', item.precioVenta ?? '', true);
  if (precioVenta === null || precioVenta === undefined) return;

  const precioCompra = pedirNumero('Precio de compra', item.precioCompra ?? '', true);
  if (precioCompra === null || precioCompra === undefined) return;

  const stock = pedirNumero('Stock', item.stock ?? '', true);
  if (stock === null || stock === undefined) return;

  const unidadDeMedida = pedirUnidadMedida(item.unidadDeMedida ?? 'UNIDAD');
  if (unidadDeMedida === null || unidadDeMedida === undefined) return;

  const etiqueta = pedirTexto('Etiqueta', item.etiqueta ?? '', false);
  if (etiqueta === null || etiqueta === undefined) return;

  const proveedorId = pedirNumero('ID del proveedor', item.proveedorId ?? '', true);
  if (proveedorId === null || proveedorId === undefined) return;

  await fetchApi('/api/productos/' + encodeURIComponent(item.codigoDeBarras), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      codigoDeBarras: Number(item.codigoDeBarras),
      descripcion,
      precioVenta,
      precioCompra,
      stock,
      unidadDeMedida,
      etiqueta,
      proveedorId,
    }),
  });

  mostrarMensaje('Producto actualizado correctamente', 'success');
  await cargarSoporteTabla();
}

async function fetchApi(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.msg || payload.mensaje || 'No se pudo completar la operación');
  }
  return payload;
}

usuarioForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await guardarUsuarioNuevo();
});

cargarSoporte.addEventListener('click', cargarSoporteTabla);
logoutBtn.addEventListener('click', cerrarSesion);
document.addEventListener('DOMContentLoaded', async () => {
  await verificarRolSistema();
  await cargarBasesDeDatos();
  await cargarSoporteTabla();
});