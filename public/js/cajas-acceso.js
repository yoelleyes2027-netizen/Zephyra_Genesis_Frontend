async function validarAccesoYRedirigirCajas() {
  try {
    const response = await fetch('/api/caja/validar-acceso', {
      method: 'GET',
      credentials: 'include'
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.msg || payload.mensaje || 'La caja global no ha sido iniciada');
    }

    window.location.href = './cajas.html';
  } catch (error) {
    alert(error.message || 'La caja global no ha sido iniciada');
  }
}
