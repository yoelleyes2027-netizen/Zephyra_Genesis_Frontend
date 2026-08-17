async function verificarAdmin() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('Sesión no válida');

    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    if (rol !== 'admin') {
      window.location.href = './login.html';
      return;
    }
  } catch {
    window.location.href = './login.html';
  }
}

async function cerrarDia() {
  const confirmar = window.confirm('Se calcularán los totales y se vaciará caja_diaria. ¿Deseas continuar?');
  if (!confirmar) return;

  try {
    const response = await fetch('/api/caja/cerrar-dia', {
      method: 'POST',
      credentials: 'include'
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.msg || payload.mensaje || 'No se pudo cerrar el día.');
    }

    alert(payload.mensaje || 'Dia cerrado correctamente');
  } catch (error) {
    alert(error.message || 'No se pudo cerrar el día.');
  }
}

document.getElementById('btn-cerrar-dia')?.addEventListener('click', cerrarDia);
document.getElementById('btn-volver')?.addEventListener('click', () => {
  window.location.href = './adminUsuario.html';
});

verificarAdmin();
