async function verificarAccesoCaja() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('Sesión no válida');

    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    if (rol === 'admin' || rol === 'cajero') {
      configurarVolver(rol);
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

verificarAccesoCaja();
