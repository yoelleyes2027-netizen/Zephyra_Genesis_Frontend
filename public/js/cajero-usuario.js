async function verificarAccesoCajero() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('Sesión no válida');

    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    if (rol === 'cajero') return;
    window.location.href = rol === 'admin' ? './adminUsuario.html' : './login.html';
  } catch {
    window.location.href = './login.html';
  }
}

document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.msg || payload.mensaje || 'No se pudo cerrar sesión.');
    }
    window.location.href = './login.html';
  } catch (error) {
    alert(error.message || 'No se pudo cerrar sesión.');
  }
});

verificarAccesoCajero();
