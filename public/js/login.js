const REMEMBER_LOGIN_KEY = 'zephyra-remember-login';
const loginForm = document.getElementById('login-form');
const cedulaLogin = document.getElementById('cedula');
const contraseñaLogin = document.getElementById('contraseña');
const recordarCredenciales = document.getElementById('recordar-credenciales');

async function restaurarCredencialesRecordadas() {
  const cedulaRecordada = localStorage.getItem(REMEMBER_LOGIN_KEY);
  if (!cedulaRecordada) {
    return;
  }

  recordarCredenciales.checked = true;
  cedulaLogin.value = cedulaRecordada;

  if (!navigator.credentials || !window.PasswordCredential) {
    return;
  }

  try {
    const credencial = await navigator.credentials.get({ password: true, mediation: 'optional' });
    if (credencial?.id === cedulaRecordada) {
      contraseñaLogin.value = credencial.password;
    }
  } catch (error) {
    console.debug('El navegador no restauró las credenciales:', error);
  }
}

async function guardarPreferenciaDeCredenciales(cedula, contraseña) {
  if (!recordarCredenciales.checked) {
    localStorage.removeItem(REMEMBER_LOGIN_KEY);
    return;
  }

  localStorage.setItem(REMEMBER_LOGIN_KEY, cedula);
  if (!navigator.credentials || !window.PasswordCredential) {
    return;
  }

  try {
    const credencial = new PasswordCredential({ id: cedula, password: contraseña, name: cedula });
    await navigator.credentials.store(credencial);
  } catch (error) {
    console.debug('El navegador no guardó las credenciales:', error);
  }
}

loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const submitButton = document.getElementById('ingresar');
  const submitText = submitButton.querySelector('.login-form__submit-text');
  const cedula = document.getElementById('cedula').value;
  const contraseña = document.getElementById('contraseña').value;

  submitButton.disabled = true;
  submitText.textContent = 'Verificando...';

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

      await guardarPreferenciaDeCredenciales(cedula, contraseña);

      const loginContainer = document.querySelector('.login-container');
      const bienvenida = document.createElement('div');
      const iconoBienvenida = document.createElement('div');
      const contenidoBienvenida = document.createElement('div');
      const estadoBienvenida = document.createElement('span');
      const mensajeBienvenida = document.createElement('p');
      const nombreUsuario = document.createElement('strong');

      bienvenida.className = 'bienvenida login-success';
      iconoBienvenida.className = 'login-success__icon';
      iconoBienvenida.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
      contenidoBienvenida.className = 'login-success__content';
      estadoBienvenida.className = 'login-success__status';
      estadoBienvenida.textContent = 'Acceso confirmado';
      mensajeBienvenida.className = 'login-success__message';
      mensajeBienvenida.append('Bienvenido, ');
      nombreUsuario.textContent = nombre;
      mensajeBienvenida.append(nombreUsuario, '!');
      contenidoBienvenida.append(estadoBienvenida, mensajeBienvenida);
      bienvenida.append(iconoBienvenida, contenidoBienvenida);
      loginContainer.replaceChildren(bienvenida);

      // Redirigir según rol después de 1.5 segundos
      setTimeout(() => {
        if (rol === 'admin_sistema') {
          window.location.href = '../html/adminSistema.html';
        } else if (rol === 'admin') {
          window.location.href = '../html/adminUsuario.html';
        } else if (rol === 'recepcion') {
          window.location.href = '../html/recepcion.html';
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
  } finally {
    submitButton.disabled = false;
    submitText.textContent = 'Ingresar';
  }
});

const toggleContraseñaLogin = document.getElementById('toggle-contraseña');
const themeToggle = document.getElementById('theme-toggle');

restaurarCredencialesRecordadas();

function actualizarBotonTema() {
  const isDark = document.documentElement.dataset.theme === 'dark';
  themeToggle.innerHTML = isDark
    ? '<i class="fas fa-sun"></i><span>Claro</span>'
    : '<i class="fas fa-moon"></i><span>Oscuro</span>';
  themeToggle.setAttribute('aria-label', isDark ? 'Activar tema claro' : 'Activar tema oscuro');
}

if (themeToggle) {
  actualizarBotonTema();
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    window.applyZephyraTheme(nextTheme);
    actualizarBotonTema();
  });
}

if (contraseñaLogin && toggleContraseñaLogin) {
  toggleContraseñaLogin.addEventListener('click', () => {
    const mostrar = contraseñaLogin.type === 'password';
    contraseñaLogin.type = mostrar ? 'text' : 'password';
    toggleContraseñaLogin.innerHTML = mostrar
      ? '<i class="fas fa-eye-slash"></i>'
      : '<i class="fas fa-eye"></i>';
    toggleContraseñaLogin.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
}