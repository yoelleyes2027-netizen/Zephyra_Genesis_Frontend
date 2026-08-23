const OPERACIONES = [
  { id: 'btn-cortar-ticket', url: './venta-caja.html' },
  { id: 'btn-devolver-ticket', url: './devolucion.html' },
  { id: 'btn-devolucion-caja', url: './devolucion-caja.html' },
  { id: 'btn-egreso', url: './egreso.html' },
  { id: 'btn-cerrar-caja', url: './cerrar-caja.html' },
];

let rolActual = '';

async function verificarAccesoCaja() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('Sesión no válida');

    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    if (rol === 'admin' || rol === 'cajero') {
      rolActual = rol;
      configurarVolver(rol);
      configurarNavegacionOperaciones();
      configurarAbrirCaja();
      await refrescarEstadoApertura();
      return;
    }

    window.location.href = './login.html';
  } catch {
    window.location.href = './login.html';
  }
}

function configurarVolver(rol) {
  const btnVolver = document.getElementById('btn-volver');
  if (!btnVolver) return;

  btnVolver.addEventListener('click', () => {
    if (rol === 'admin') {
      window.location.href = './adminUsuario.html';
      return;
    }
    window.location.href = './cajeroUsuario.html';
  });
}

function configurarNavegacionOperaciones() {
  OPERACIONES.forEach(({ id, url }) => {
    const button = document.getElementById(id);
    if (!button) return;
    button.addEventListener('click', () => {
      if (button.disabled) return;
      window.location.href = url;
    });
  });
}

function setOperacionesHabilitadas(habilitadas) {
  OPERACIONES.forEach(({ id }) => {
    const button = document.getElementById(id);
    if (button) button.disabled = !habilitadas;
  });
}

function configurarAbrirCaja() {
  const btnAbrirCaja = document.getElementById('btn-abrir-caja');
  if (!btnAbrirCaja) return;

  btnAbrirCaja.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/caja/abrir', {
        method: 'POST',
        credentials: 'include',
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.msg || payload.mensaje || 'No se pudo abrir caja.');
      }
      await refrescarEstadoApertura();
    } catch (error) {
      alert(error.message || 'No se pudo abrir caja.');
    }
  });
}

async function refrescarEstadoApertura() {
  const estadoElement = document.getElementById('estado-caja');
  const btnAbrirCaja = document.getElementById('btn-abrir-caja');
  try {
    const response = await fetch('/api/caja/estado-apertura', { credentials: 'include' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.msg || payload.mensaje || 'No se pudo validar el estado de caja.');
    }

    const abierta = payload.abierta === true;
    setOperacionesHabilitadas(abierta);
    if (estadoElement) {
      estadoElement.textContent = abierta
        ? 'Caja abierta. Ya puedes operar.'
        : 'Para operar, primero debes abrir caja.';
    }
    if (btnAbrirCaja) {
      btnAbrirCaja.disabled = abierta;
      btnAbrirCaja.innerHTML = abierta
        ? '<i class="fas fa-circle-check" aria-hidden="true"></i> Caja abierta'
        : '<i class="fas fa-box-open" aria-hidden="true"></i> Abrir caja';
    }
  } catch {
    setOperacionesHabilitadas(false);
    if (estadoElement) {
      estadoElement.textContent = 'No se pudo validar el estado de caja.';
    }
    if (btnAbrirCaja) {
      btnAbrirCaja.disabled = false;
    }
  }
}

verificarAccesoCaja();
