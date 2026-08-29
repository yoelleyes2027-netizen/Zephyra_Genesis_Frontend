async function validarRol() {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) throw new Error('Sesion no valida');
    const payload = await response.json();
    const rol = (payload.usuario?.rol || '').toLowerCase();
    if (rol !== 'admin' && rol !== 'recepcion') throw new Error('Sin permisos');
  } catch {
    window.location.href = './login.html';
  }
}

document.getElementById('btn-volver').addEventListener('click', () => {
  window.history.back();
});

validarRol();
