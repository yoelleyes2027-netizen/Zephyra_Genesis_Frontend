let destinoVolver = './adminUsuario.html';

const form = document.getElementById('cerrar-caja-form');
const mensaje = document.getElementById('mensaje');
const btnCerrar = document.getElementById('btn-cerrar-caja');

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
}

async function leerRespuesta(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.msg || payload.mensaje || 'No se pudo cerrar caja.');
  }
  return payload;
}

async function inicializar() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('Sesión no válida');

    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    if (rol !== 'admin' && rol !== 'cajero') {
      window.location.href = './login.html';
      return;
    }
    destinoVolver = rol === 'admin' ? './adminUsuario.html' : './cajeroUsuario.html';
  } catch {
    window.location.href = './login.html';
  }
}

document.getElementById('btn-volver').addEventListener('click', () => {
  window.location.href = destinoVolver;
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  btnCerrar.disabled = true;
  mostrarMensaje('Procesando cierre de caja...', '');

  try {
    const payload = {
      posDeclarado: Number(document.getElementById('pos-declarado').value),
      efectivoDeclarado: Number(document.getElementById('efectivo-declarado').value),
      cedulaAdmin: Number(document.getElementById('cedula-admin').value),
      contrasenaAdmin: document.getElementById('password-admin').value,
    };

    const response = await fetch('/api/caja/cerrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    await leerRespuesta(response);
    mostrarMensaje('Caja cerrada correctamente.', 'exito');
    setTimeout(() => {
      window.location.href = destinoVolver;
    }, 900);
  } catch (error) {
    mostrarMensaje(error.message, 'error');
    btnCerrar.disabled = false;
  }
});

inicializar();
