const mensaje = document.getElementById('mensaje');
const btnVolver = document.getElementById('btn-volver');

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = `mensaje ${tipo}`;
}

async function validarAccesoAdmin() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('Sesión no válida');
    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    if (rol !== 'admin') {
      window.location.href = './login.html';
    }
  } catch {
    window.location.href = './login.html';
  }
}

document.getElementById('btn-iniciar-dia').addEventListener('click', async () => {
  btnVolver.classList.add('oculto');
  mostrarMensaje('Procesando inicio del día...', '');

  try {
    const response = await fetch('/api/caja/iniciar-dia', {
      method: 'POST',
      credentials: 'include',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      throw new Error(payload.msg || payload.mensaje || 'Hubo un error en el sistema');
    }

    const cotizacion = Number(payload.cotizacion_usd_uyu);
    if (Number.isFinite(cotizacion) && cotizacion > 0) {
      mostrarMensaje(`Dia iniciado correctamente. USD 1 = UYU ${cotizacion.toFixed(2)}.`, 'exito');
      btnVolver.classList.remove('oculto');
      return;
    }
    mostrarMensaje('Dia iniciado correctamente', 'exito');
    btnVolver.classList.remove('oculto');
  } catch {
    mostrarMensaje('Hubo un error en el sistema', 'error');
  }
});

btnVolver.addEventListener('click', () => {
  window.location.href = './adminUsuario.html';
});

validarAccesoAdmin();