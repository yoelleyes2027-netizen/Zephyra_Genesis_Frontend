document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const cedula = document.getElementById('cedula').value;
  const contraseña = document.getElementById('contraseña').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Necesario para recibir la cookie
      body: JSON.stringify({ cedula, contraseña }),
    });

    const responseText = await res.text();
    let data = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { ok: false, msg: responseText || 'Respuesta inválida del servidor' };
    }
    console.log('Respuesta del servidor:', data); // <-- LOG IMPORTANTE

    if (res.ok) {
      const rol = data.user.rol;
      const nombre = data.user.nombre;
    
      const loginContainer = document.querySelector('.login-container');
      loginContainer.innerHTML = `
        <div class="bienvenida">
          Bienvenido, <strong>${nombre}</strong>!
        </div>
      `;
    
      // Redirigir según rol después de 1.5 segundos
      setTimeout(() => {
        if (rol === 'admin_sistema') {
          window.location.href = '../html/adminSistema.html';
        } else if (rol === 'admin' || rol === 'recepcion') {
          window.location.href = '../html/adminUsuario.html';
        } else if (rol === 'cajero') {
          window.location.href = '../html/ticket.html';
        } else {
          window.location.href = '../html/adminUsuario.html';
        }
      }, 1500);
    
    } else {
      document.getElementById('mensaje-error').textContent = data.msg || 'Error al iniciar sesión';
    }

  } catch (error) {
    console.error('Error en el login:', error);
    document.getElementById('mensaje-error').textContent = 'Error al conectar con el servidor';
  }
});