const usuarioForm = document.getElementById('usuario-form');
const soporteHead = document.getElementById('soporte-head');
const soporteBody = document.getElementById('soporte-body');
const cargarSoporte = document.getElementById('cargar-soporte');
const baseSoporteSelect = document.getElementById('base-soporte');
const tablaSoporte = document.getElementById('tabla-soporte');
const logoutBtn = document.getElementById('logout-btn');
const usuarioDbSelect = document.getElementById('usuario-db');
const adminSistemaMensaje = document.getElementById('admin-sistema-mensaje');
const usuarioPassword = document.getElementById('usuario-password');
const usuarioPasswordError = document.getElementById('usuario-password-error');
const toggleUsuarioPassword = document.getElementById('toggle-usuario-password');
const soporteEditModal = document.getElementById('soporte-edit-modal');
const soporteEditTitle = document.getElementById('soporte-edit-title');
const soporteEditBody = document.getElementById('soporte-edit-body');
const soporteEditForm = document.getElementById('soporte-edit-form');
const consumidorFinalDbSelect = document.getElementById('consumidor-final-db');
const consumidorFinalResultado = document.getElementById('consumidor-final-resultado');
const passwordSeguraRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function mostrarErrorContrasena(mensaje = '') {
  if (usuarioPasswordError) {
    usuarioPasswordError.textContent = mensaje;
  }
  if (usuarioPassword) {
    usuarioPassword.setCustomValidity(mensaje);
  }
}

let soporteItemsCache = [];
let baseSoporteActual = '';
let tablaSoporteActual = 'usuarios';
let soporteEditState = null;

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

function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function obtenerValorTexto(item, claves, fallback = '') {
  for (const clave of claves) {
    const valor = item?.[clave];
    if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
      return String(valor);
    }
  }
  return fallback;
}

function construirInputCampo(campo) {
  const atributos = [
    `name="${escapeHtml(campo.name)}"`,
    `id="soporte-${escapeHtml(campo.name)}"`,
    `class="form-control"`,
    `value="${escapeHtml(campo.value ?? '')}"`,
  ];
  if (campo.type) atributos.unshift(`type="${escapeHtml(campo.type)}"`);
  if (campo.step) atributos.push(`step="${escapeHtml(campo.step)}"`);
  if (campo.placeholder) atributos.push(`placeholder="${escapeHtml(campo.placeholder)}"`);
  if (campo.required) atributos.push('required');
  if (campo.readOnly) atributos.push('readonly');
  if (campo.min !== undefined) atributos.push(`min="${escapeHtml(campo.min)}"`);
  if (campo.max !== undefined) atributos.push(`max="${escapeHtml(campo.max)}"`);
  return `<input ${atributos.join(' ')}>`;
}

function construirSelectCampo(campo) {
  const opciones = (campo.options || []).map((opcion) => {
    const selected = String(opcion.value) === String(campo.value) ? 'selected' : '';
    return `<option value="${escapeHtml(opcion.value)}" ${selected}>${escapeHtml(opcion.label)}</option>`;
  }).join('');
  const atributos = [
    `name="${escapeHtml(campo.name)}"`,
    `id="soporte-${escapeHtml(campo.name)}"`,
    'class="form-select"',
  ];
  if (campo.required) atributos.push('required');
  return `<select ${atributos.join(' ')}>${opciones}</select>`;
}

function camposEdicionSoporte(tabla, item) {
  switch (tabla) {
    case 'usuarios':
    case 'usuario':
      return [
        { name: 'nombre', label: 'Nombre completo', type: 'text', value: obtenerValorTexto(item, ['nombre', 'name']), required: true },
        { name: 'cedula', label: 'Cédula', type: 'number', value: obtenerValorTexto(item, ['cedula']), required: true },
        { name: 'contraseña', label: 'Contraseña nueva', type: 'password', value: '', placeholder: 'Dejar vacío para no cambiarla' },
        { name: 'rol', label: 'Rol', type: 'select', value: obtenerValorTexto(item, ['rol']).toUpperCase(), required: true, options: [
          { value: '', label: 'Seleccionar rol' },
          { value: 'ADMIN', label: 'Admin' },
          { value: 'RECEPCION', label: 'Recepción' },
          { value: 'CAJERO', label: 'Cajero' },
        ] },
        { name: 'email', label: 'Email', type: 'email', value: obtenerValorTexto(item, ['email']), placeholder: 'Email del usuario' },
        { name: 'telefono', label: 'Teléfono', type: 'number', value: obtenerValorTexto(item, ['telefono']), placeholder: 'Opcional' },
        { name: 'tenantDatabase', label: 'Base de datos', type: 'text', value: obtenerValorTexto(item, ['tenantDatabase']), required: true },
      ];
    case 'clientes':
    case 'cliente':
      return [
        { name: 'name', label: 'Nombre completo', type: 'text', value: obtenerValorTexto(item, ['name', 'nombre']), required: true },
        { name: 'email', label: 'Email', type: 'email', value: obtenerValorTexto(item, ['email']), required: true },
        { name: 'telefono', label: 'Teléfono', type: 'number', value: obtenerValorTexto(item, ['telefono']), placeholder: 'Opcional' },
      ];
    case 'proveedores':
    case 'proveedor':
      return [
        { name: 'name', label: 'Nombre', type: 'text', value: obtenerValorTexto(item, ['name', 'nombre']), required: true },
        { name: 'email', label: 'Email', type: 'email', value: obtenerValorTexto(item, ['email']), placeholder: 'Opcional' },
        { name: 'telefono', label: 'Teléfono', type: 'number', value: obtenerValorTexto(item, ['telefono']), placeholder: 'Opcional' },
        { name: 'numeroDocumento', label: 'Número de documento', type: 'text', value: obtenerValorTexto(item, ['numeroDocumento']), required: true },
        { name: 'direccion', label: 'Dirección', type: 'text', value: obtenerValorTexto(item, ['direccion']), placeholder: 'Opcional' },
        { name: 'razonSocial', label: 'Razón social', type: 'text', value: obtenerValorTexto(item, ['razonSocial']), required: true },
        { name: 'tipoDocumento', label: 'Tipo de documento', type: 'select', value: obtenerValorTexto(item, ['tipoDocumento']).toUpperCase(), options: [
          { value: 'CI', label: 'CI' },
          { value: 'RUT', label: 'RUT' },
          { value: 'RUC', label: 'RUC' },
        ] },
      ];
    case 'empresas':
    case 'empresa':
      return [
        { name: 'name', label: 'Nombre', type: 'text', value: obtenerValorTexto(item, ['name', 'nombre']), required: true },
        { name: 'email', label: 'Email', type: 'email', value: obtenerValorTexto(item, ['email']), placeholder: 'Opcional' },
        { name: 'telefono', label: 'Teléfono', type: 'number', value: obtenerValorTexto(item, ['telefono']), placeholder: 'Opcional' },
        { name: 'razonSocial', label: 'Razón social', type: 'text', value: obtenerValorTexto(item, ['razonSocial']), required: true },
        { name: 'tipoDocumento', label: 'Tipo de documento', type: 'select', value: obtenerValorTexto(item, ['tipoDocumento']).toUpperCase(), required: true, options: [
          { value: 'CI', label: 'CI' },
          { value: 'RUT', label: 'RUT' },
          { value: 'RUC', label: 'RUC' },
        ] },
        { name: 'direccion', label: 'Dirección', type: 'text', value: obtenerValorTexto(item, ['direccion']), placeholder: 'Opcional' },
        { name: 'numeroDocumento', label: 'Número de documento', type: 'text', value: obtenerValorTexto(item, ['numeroDocumento']), required: true },
      ];
    case 'productos':
    case 'producto':
      return [
        { name: 'descripcion', label: 'Descripción', type: 'text', value: obtenerValorTexto(item, ['descripcion']), required: true },
        { name: 'precioVenta', label: 'Precio de venta', type: 'number', step: 'any', value: obtenerValorTexto(item, ['precioVenta']), required: true },
        { name: 'precioCompra', label: 'Precio de compra', type: 'number', step: 'any', value: obtenerValorTexto(item, ['precioCompra']), required: true },
        { name: 'stock', label: 'Stock', type: 'number', value: obtenerValorTexto(item, ['stock']), required: true },
        { name: 'unidadDeMedida', label: 'Unidad de medida', type: 'select', value: obtenerValorTexto(item, ['unidadDeMedida']).toUpperCase(), required: true, options: [
          { value: 'KILOGRAMO', label: 'KILOGRAMO' },
          { value: 'LITRO', label: 'LITRO' },
          { value: 'UNIDAD', label: 'UNIDAD' },
        ] },
        { name: 'etiqueta', label: 'Etiqueta', type: 'text', value: obtenerValorTexto(item, ['etiqueta']), placeholder: 'Opcional' },
        { name: 'proveedorId', label: 'ID del proveedor', type: 'number', value: obtenerValorTexto(item, ['proveedorId']), required: true },
      ];
    default:
      return [];
  }
}

function renderCamposEdicionSoporte(tabla, item) {
  const campos = camposEdicionSoporte(tabla, item);
  if (!campos.length) {
    return '<div class="alert alert-warning mb-0">La edición no está disponible para esta tabla.</div>';
  }

  return `<div class="row g-3">${campos.map((campo) => `
    <div class="${campo.name === 'contraseña' || campo.name === 'direccion' || campo.name === 'etiqueta' ? 'col-md-12' : 'col-md-6'}">
      <label class="form-label" for="soporte-${escapeHtml(campo.name)}">${escapeHtml(campo.label)}</label>
      ${campo.type === 'select' ? construirSelectCampo(campo) : construirInputCampo(campo)}
      ${campo.placeholder ? `<small class="text-muted d-block mt-1">${escapeHtml(campo.placeholder)}</small>` : ''}
    </div>
  `).join('')}</div>`;
}

function abrirModalEdicionSoporte(tabla, item) {
  soporteEditState = { tabla, item };
  soporteEditTitle.textContent = `Editar ${tabla.replaceAll('_', ' ')}`;
  soporteEditBody.innerHTML = renderCamposEdicionSoporte(tabla, item);
  soporteEditModal.classList.remove('d-none');
  soporteEditModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  window.setTimeout(() => {
    const primerCampo = soporteEditBody.querySelector('input, select, textarea');
    if (primerCampo) primerCampo.focus();
  }, 0);
}

function cerrarModalEdicionSoporte() {
  soporteEditState = null;
  soporteEditBody.innerHTML = '';
  soporteEditModal.classList.add('d-none');
  soporteEditModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function valorCampoFormulario(formData, name) {
  const value = formData.get(name);
  return value === null ? '' : String(value).trim();
}

function construirPayloadEdicion(tabla, item, formData) {
  switch (tabla) {
    case 'usuarios':
    case 'usuario':
      return {
        nombre: valorCampoFormulario(formData, 'nombre'),
        cedula: Number(valorCampoFormulario(formData, 'cedula')),
        contraseña: valorCampoFormulario(formData, 'contraseña'),
        rol: valorCampoFormulario(formData, 'rol'),
        email: valorCampoFormulario(formData, 'email'),
        telefono: Number(valorCampoFormulario(formData, 'telefono') || 0),
        tenantDatabase: valorCampoFormulario(formData, 'tenantDatabase'),
      };
    case 'clientes':
    case 'cliente':
      return {
        name: valorCampoFormulario(formData, 'name'),
        email: valorCampoFormulario(formData, 'email'),
        telefono: Number(valorCampoFormulario(formData, 'telefono') || 0),
      };
    case 'proveedores':
    case 'proveedor':
      return {
        name: valorCampoFormulario(formData, 'name'),
        email: valorCampoFormulario(formData, 'email'),
        telefono: Number(valorCampoFormulario(formData, 'telefono') || 0),
        numeroDocumento: valorCampoFormulario(formData, 'numeroDocumento'),
        direccion: valorCampoFormulario(formData, 'direccion'),
        razonSocial: valorCampoFormulario(formData, 'razonSocial'),
        tipoDocumento: valorCampoFormulario(formData, 'tipoDocumento'),
      };
    case 'empresas':
    case 'empresa':
      return {
        name: valorCampoFormulario(formData, 'name'),
        email: valorCampoFormulario(formData, 'email'),
        telefono: Number(valorCampoFormulario(formData, 'telefono') || 0),
        razonSocial: valorCampoFormulario(formData, 'razonSocial'),
        tipoDocumento: valorCampoFormulario(formData, 'tipoDocumento'),
        direccion: valorCampoFormulario(formData, 'direccion'),
        numeroDocumento: valorCampoFormulario(formData, 'numeroDocumento'),
      };
    case 'productos':
    case 'producto':
      return {
        codigoDeBarras: Number(item.codigoDeBarras),
        descripcion: valorCampoFormulario(formData, 'descripcion'),
        precioVenta: Number(valorCampoFormulario(formData, 'precioVenta') || 0),
        precioCompra: Number(valorCampoFormulario(formData, 'precioCompra') || 0),
        stock: Number(valorCampoFormulario(formData, 'stock') || 0),
        unidadDeMedida: valorCampoFormulario(formData, 'unidadDeMedida'),
        etiqueta: valorCampoFormulario(formData, 'etiqueta'),
        proveedorId: Number(valorCampoFormulario(formData, 'proveedorId') || 0),
      };
    default:
      return {};
  }
}

async function guardarEdicionSoporte(event) {
  event.preventDefault();
  if (!soporteEditState) {
    return;
  }

  const { tabla, item } = soporteEditState;
  const formData = new FormData(soporteEditForm);
  const clave = obtenerClaveSoporte(tabla, item);
  const payload = construirPayloadEdicion(tabla, item, formData);

  if (!clave) {
    mostrarMensaje('No se pudo identificar el registro', 'error');
    return;
  }

  if (tabla === 'usuarios' || tabla === 'usuario') {
    if (!payload.rol) {
      mostrarMensaje('Debe seleccionar un rol', 'error');
      return;
    }
    if (!payload.tenantDatabase) {
      mostrarMensaje('Debe seleccionar una base de datos', 'error');
      return;
    }
  }

  try {
    await editarRegistroSoporte(String(clave), payload);
    mostrarMensaje('Registro actualizado correctamente', 'success');
    cerrarModalEdicionSoporte();
    await cargarSoporteTabla();
  } catch (error) {
    mostrarMensaje(error.message || 'No se pudo actualizar el registro', 'error');
  }
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

  usuarioPassword.addEventListener('input', () => {
    if (!usuarioPassword.value || passwordSeguraRegex.test(usuarioPassword.value)) {
      mostrarErrorContrasena('');
      if (adminSistemaMensaje && adminSistemaMensaje.className.includes('text-danger')) {
        mostrarMensaje('');
      }
    }
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

async function obtenerBasesDeDatos() {
  const response = await fetch('/api/admin-sistema/bases-datos', { credentials: 'include' });
  if (!response.ok) throw new Error('No se pudieron cargar las BDD');
  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}

function poblarSelectBases(selectElement, bases, placeholder, selectedValue = '') {
  selectElement.innerHTML = '';

  if (!bases.length) {
    selectElement.innerHTML = `<option value="">${placeholder}</option>`;
    return;
  }

  selectElement.insertAdjacentHTML('beforeend', `<option value="">${placeholder}</option>`);
  bases.forEach((base) => {
    const option = document.createElement('option');
    option.value = base;
    option.textContent = base;
    selectElement.appendChild(option);
  });

  if (selectedValue && bases.includes(selectedValue)) {
    selectElement.value = selectedValue;
  }
}

async function cargarBasesDeDatos() {
  try {
    usuarioDbSelect.innerHTML = '<option value="">Cargando BDD...</option>';
    const bases = await obtenerBasesDeDatos();
    poblarSelectBases(usuarioDbSelect, bases, 'Seleccionar BDD...', usuarioDbSelect.value);
  } catch (error) {
    usuarioDbSelect.innerHTML = '<option value="">Error al cargar BDD</option>';
    mostrarMensajeError(error);
  }
}

async function cargarBasesSoporte() {
  try {
    baseSoporteSelect.innerHTML = '<option value="">Cargando BDD...</option>';
    const bases = await obtenerBasesDeDatos();
    poblarSelectBases(baseSoporteSelect, bases, 'Seleccionar BDD...', baseSoporteActual);
    baseSoporteActual = baseSoporteSelect.value;
    await cargarTablasSoporte();
  } catch (error) {
    baseSoporteSelect.innerHTML = '<option value="">Error al cargar BDD</option>';
    mostrarMensajeError(error);
  }
}

async function cargarBasesConsumidorFinal() {
  if (!consumidorFinalDbSelect) return;

  try {
    consumidorFinalDbSelect.innerHTML = '<option value="">Cargando BDD...</option>';
    const bases = await obtenerBasesDeDatos();
    poblarSelectBases(consumidorFinalDbSelect, bases, 'Seleccionar BDD...');
  } catch (error) {
    consumidorFinalDbSelect.innerHTML = '<option value="">Error al cargar BDD</option>';
    if (consumidorFinalResultado) {
      consumidorFinalResultado.textContent = error.message || 'No se pudieron cargar las BDD.';
      consumidorFinalResultado.className = 'text-danger';
    }
  }
}

async function prepararConsumidorFinal() {
  const baseDatos = consumidorFinalDbSelect?.value.trim();
  if (!consumidorFinalResultado) return;
  if (!baseDatos) {
    consumidorFinalResultado.textContent = 'Selecciona una BDD para consultar el consumidor final.';
    consumidorFinalResultado.className = 'text-muted';
    return;
  }

  consumidorFinalResultado.textContent = 'Preparando consumidor final...';
  consumidorFinalResultado.className = 'text-primary';
  try {
    const payload = await fetchApi(`/api/admin-sistema/consumidor-final?baseDatos=${encodeURIComponent(baseDatos)}`, {
      method: 'POST',
    });
    const consumidor = payload.data;
    consumidorFinalResultado.textContent = `ID ${consumidor.id}: ${consumidor.nombre} (${consumidor.email})`;
    consumidorFinalResultado.className = 'text-success fw-semibold';
  } catch (error) {
    consumidorFinalResultado.textContent = error.message || 'No se pudo preparar el consumidor final.';
    consumidorFinalResultado.className = 'text-danger';
  }
}

async function cargarTablasSoporte() {
  const baseDatos = baseSoporteSelect.value.trim();
  baseSoporteActual = baseDatos;
  tablaSoporte.innerHTML = '<option value="">Cargando tablas...</option>';
  tablaSoporte.disabled = true;
  soporteHead.innerHTML = '<tr><th>Tabla</th></tr>';
  soporteBody.innerHTML = '<tr><td>Selecciona una BDD para ver sus tablas</td></tr>';

  if (!baseDatos) {
    tablaSoporte.innerHTML = '<option value="">Seleccionar tabla...</option>';
    return;
  }

  try {
    const response = await fetch(`/api/admin-sistema/tablas?baseDatos=${encodeURIComponent(baseDatos)}`, { credentials: 'include' });
    if (!response.ok) throw new Error('No se pudieron cargar las tablas');
    const payload = await response.json();
    const tablas = Array.isArray(payload.data) ? payload.data : [];
    tablaSoporte.innerHTML = '';

    if (!tablas.length) {
      tablaSoporte.innerHTML = '<option value="">No hay tablas disponibles</option>';
      soporteBody.innerHTML = '<tr><td>No se encontraron tablas en esta BDD</td></tr>';
      return;
    }

    tablaSoporte.insertAdjacentHTML('beforeend', '<option value="">Seleccionar tabla...</option>');
    tablas.forEach((tabla) => {
      const option = document.createElement('option');
      option.value = tabla;
      option.textContent = tabla;
      tablaSoporte.appendChild(option);
    });

    tablaSoporte.disabled = false;
    tablaSoporte.value = tablas[0];
    tablaSoporteActual = tablaSoporte.value;
    await cargarSoporteTabla();
  } catch (error) {
    tablaSoporte.innerHTML = '<option value="">Error al cargar tablas</option>';
    mostrarMensajeError(error);
  }
}

function limpiarFormularioUsuario() {
  usuarioForm.reset();
  document.getElementById('usuario-rol').value = '';
  if (usuarioDbSelect) {
    usuarioDbSelect.value = '';
  }
  mostrarErrorContrasena('');
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

function obtenerClaveSoporte(tabla, item) {
  switch (tabla) {
    case 'usuarios':
    case 'usuario':
      return String(item.cedula ?? item.id ?? '');
    case 'clientes':
    case 'cliente':
      return String(item.email ?? item.id ?? '');
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
      return String(item.id ?? '');
    case 'detalle_ticket':
    case 'detalle-ticket':
    case 'detalleticket':
      return `${item.ticketId ?? ''}:${item.productoId ?? ''}`;
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

  const accionesEdicion = new Set(['usuarios', 'usuario', 'clientes', 'cliente', 'proveedores', 'proveedor', 'empresas', 'empresa', 'productos', 'producto']);
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
  soporteHead.innerHTML = `<tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}<th>Acciones</th></tr>`;
  soporteBody.innerHTML = soporteItemsCache.map((item) => {
    const celdas = columns.map((column) => `<td>${escapeHtml(Array.isArray(item[column]) ? item[column].join(', ') : (item[column] ?? ''))}</td>`).join('');
    return `<tr>${celdas}<td>${accionesSoporteHtml(tablaSoporteActual, item)}</td></tr>`;
  }).join('');
}

async function cargarSoporteTabla() {
  try {
    const tablaSeleccionada = tablaSoporte.value.trim();
    const baseDatosSeleccionada = baseSoporteSelect.value.trim();
    if (!baseDatosSeleccionada) {
      soporteHead.innerHTML = '<tr><th>Tabla</th></tr>';
      soporteBody.innerHTML = '<tr><td>Selecciona una BDD para ver el soporte</td></tr>';
      return;
    }
    if (!tablaSeleccionada) {
      soporteHead.innerHTML = '<tr><th>Tabla</th></tr>';
      soporteBody.innerHTML = '<tr><td>Selecciona una tabla para ver el soporte</td></tr>';
      return;
    }

    tablaSoporteActual = tablaSeleccionada;
    const response = await fetch(`/api/admin-sistema/soporte?baseDatos=${encodeURIComponent(baseDatosSeleccionada)}&tabla=${encodeURIComponent(tablaSoporteActual)}`, { credentials: 'include' });
    if (!response.ok) throw new Error('No se pudo cargar la tabla');
    const payload = await response.json();
    const items = Array.isArray(payload.data?.data) ? payload.data.data : [];
    renderSoporteTabla(items);
  } catch (error) {
    soporteHead.innerHTML = '<tr><th>Error</th></tr>';
    soporteBody.innerHTML = `<tr><td>${escapeHtml(error.message || 'No se pudo cargar el soporte')}</td></tr>`;
  }
}

async function editarRegistroSoporte(clave, data) {
  return fetchApi('/api/admin-sistema/soporte', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      baseDatos: baseSoporteSelect.value.trim(),
      tabla: tablaSoporteActual,
      clave,
      data,
    }),
  });
}

async function eliminarRegistroSoporte(clave) {
  return fetchApi('/api/admin-sistema/soporte', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      baseDatos: baseSoporteSelect.value.trim(),
      tabla: tablaSoporteActual,
      clave,
    }),
  });
}

async function guardarUsuarioNuevo() {
  const body = formDataUsuario();
  if (!body.rol) {
    mostrarMensaje('Debe seleccionar un rol', 'error');
    return;
  }
  if (!body.contraseña) {
    mostrarErrorContrasena('La contraseña es obligatoria para crear un usuario');
    mostrarMensaje('La contraseña es obligatoria para crear un usuario', 'error');
    return;
  }
  if (!passwordSeguraRegex.test(body.contraseña)) {
    mostrarErrorContrasena('Debe tener al menos 8 caracteres, una mayúscula y un número');
    mostrarMensaje('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número', 'error');
    usuarioPassword.focus();
    return;
  }
  mostrarErrorContrasena('');
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
  abrirModalEdicionSoporte(tabla, item);
}

async function eliminarItemSoporte(tabla, item) {
  switch (tabla) {
    case 'usuarios':
    case 'usuario':
      if (!window.confirm(`¿Eliminar el usuario ${item.cedula}?`)) return;
      await eliminarRegistroSoporte(String(item.cedula));
      mostrarMensaje('Usuario eliminado correctamente', 'success');
      break;
    case 'clientes':
    case 'cliente':
      if (!window.confirm(`¿Eliminar el cliente ${item.email}?`)) return;
      await eliminarRegistroSoporte(String(item.email));
      mostrarMensaje('Cliente eliminado correctamente', 'success');
      break;
    case 'proveedores':
    case 'proveedor':
      if (!window.confirm(`¿Eliminar el proveedor ${item.numeroDocumento}?`)) return;
      await eliminarRegistroSoporte(String(item.numeroDocumento));
      mostrarMensaje('Proveedor eliminado correctamente', 'success');
      break;
    case 'empresas':
    case 'empresa':
      if (!window.confirm(`¿Eliminar la empresa ${item.numeroDocumento}?`)) return;
      await eliminarRegistroSoporte(String(item.numeroDocumento));
      mostrarMensaje('Empresa eliminada correctamente', 'success');
      break;
    case 'productos':
    case 'producto':
      if (!window.confirm(`¿Eliminar el producto ${item.codigoDeBarras}?`)) return;
      await eliminarRegistroSoporte(String(item.codigoDeBarras));
      mostrarMensaje('Producto eliminado correctamente', 'success');
      break;
    default:
      throw new Error('La eliminación no está disponible para esta tabla.');
  }

  await cargarSoporteTabla();
}

async function desactivarTicket(item) {
  if (!window.confirm(`¿Desactivar el ticket ${item.id}?`)) return;
  await eliminarRegistroSoporte(String(item.id));
  mostrarMensaje('Ticket desactivado correctamente', 'success');
  await cargarSoporteTabla();
}

async function eliminarArticulosDetalle(item) {
  const clave = `${item.ticketId}:${item.productoId}`;
  if (!window.confirm(`¿Eliminar el detalle del ticket ${item.ticketId} para el producto ${item.productoId}?`)) return;
  await eliminarRegistroSoporte(clave);
  mostrarMensaje('Detalle eliminado correctamente', 'success');
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

if (soporteEditForm) {
  soporteEditForm.addEventListener('submit', guardarEdicionSoporte);
}

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-soporte-close]')) {
    cerrarModalEdicionSoporte();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && soporteEditModal && !soporteEditModal.classList.contains('d-none')) {
    cerrarModalEdicionSoporte();
  }
});

cargarSoporte.addEventListener('click', cargarSoporteTabla);
baseSoporteSelect.addEventListener('change', cargarTablasSoporte);
tablaSoporte.addEventListener('change', cargarSoporteTabla);
logoutBtn.addEventListener('click', cerrarSesion);
if (consumidorFinalDbSelect) {
  consumidorFinalDbSelect.addEventListener('change', prepararConsumidorFinal);
}
document.addEventListener('DOMContentLoaded', async () => {
  await verificarRolSistema();
  await cargarBasesDeDatos();
  await cargarBasesSoporte();
  await cargarBasesConsumidorFinal();
});