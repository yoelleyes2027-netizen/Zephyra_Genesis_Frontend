document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/auth/verificar-token', { credentials: 'include' });
    if (!response.ok) {
      window.location.href = './login.html';
      return;
    }

    const payload = await response.json();
    if ((payload.usuario?.rol || '').toLowerCase() !== 'recepcion') {
      window.location.href = './adminUsuario.html';
    }
  } catch {
    window.location.href = './login.html';
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  window.location.href = './login.html';
});