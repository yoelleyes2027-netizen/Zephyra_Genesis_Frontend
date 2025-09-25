document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-etiqueta');
    const mensaje = document.getElementById('mensaje-respuesta');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const nombre = document.getElementById('nombre').value.trim();
  
      if (!nombre) {
        mensaje.textContent = 'Debes ingresar un nombre de etiqueta.';
        mensaje.style.color = 'red';
        return;
      }
  
      try {
        const res = await fetch('/api/etiquetas/agregar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // importante para enviar cookies
          body: JSON.stringify({ nombre })
        });
  
        const data = await res.json();
  
        if (data.ok) {
          mensaje.textContent = data.msg;
          mensaje.style.color = 'green';
          form.reset();
        } else {
          mensaje.textContent = data.msg || 'Error al agregar.';
          mensaje.style.color = 'red';
        }
      } catch (error) {
        console.error('Error al enviar la etiqueta:', error);
        mensaje.textContent = 'Error de conexión con el servidor.';
        mensaje.style.color = 'red';
      }
    });
  });