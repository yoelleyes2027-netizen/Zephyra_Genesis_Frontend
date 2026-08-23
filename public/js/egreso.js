const autorizacionPanel = document.getElementById('autorizacion-panel');
const egresoPanel = document.getElementById('egreso-panel');
const egresoForm = document.getElementById('egreso-form');

function mostrarMensaje(elemento, mensaje = '', tipo = '') {
  elemento.textContent = mensaje;
  elemento.className = `cash-message ${tipo}`.trim();
}

async function leerRespuesta(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.mensaje || payload.msg || 'No se pudo completar la operación.');
  }
  return payload;
}

async function validarRol() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('Sesión no válida');
    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    if (rol !== 'admin' && rol !== 'cajero') {
      window.location.href = './login.html';
    }
  } catch {
    window.location.href = './login.html';
  }
}

document.getElementById('autorizacion-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const mensaje = document.getElementById('autorizacion-mensaje');
  const cedula = Number(document.getElementById('autorizacion-cedula').value);
  const contraseña = document.getElementById('autorizacion-password').value;

  try {
    const response = await fetch('/api/tickets/devoluciones/autorizacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ cedula, contraseña }),
    });
    await leerRespuesta(response);
    mostrarMensaje(mensaje, 'Autorización aprobada.', 'success');
    window.setTimeout(() => {
      autorizacionPanel.hidden = true;
      egresoPanel.hidden = false;
      document.getElementById('monto-egreso').focus();
    }, 300);
  } catch (error) {
    mostrarMensaje(mensaje, error.message, 'error');
  }
});

egresoForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const mensaje = document.getElementById('egreso-mensaje');
  const boton = document.getElementById('btn-generar-egreso');
  const tipoEgreso = document.getElementById('tipo-egreso').value;
  const monto = Number(document.getElementById('monto-egreso').value);

  if (!Number.isFinite(monto) || monto <= 0) {
    mostrarMensaje(mensaje, 'Ingresa un monto de egreso mayor a 0.', 'error');
    return;
  }

  boton.disabled = true;
  mostrarMensaje(mensaje);

  try {
    const response = await fetch('/api/tickets/egresos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ tipoEgreso, monto }),
    });
    const payload = await leerRespuesta(response);
    mostrarMensaje(mensaje, `Egreso generado con éxito. Ticket #${payload.ticket_id}.`, 'success');
    egresoForm.reset();
    window.setTimeout(() => {
      window.location.href = './cajas.html';
    }, 1000);
  } catch (error) {
    mostrarMensaje(mensaje, error.message, 'error');
    boton.disabled = false;
  }
});

document.getElementById('btn-volver-cajas').addEventListener('click', () => {
  window.location.href = './cajas.html';
});

validarRol();
