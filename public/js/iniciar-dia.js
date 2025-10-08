document.getElementById('btn-iniciar-dia').addEventListener('click', async () => {
    const mensaje = document.getElementById('mensaje');
    mensaje.classList.add('oculto');
    mensaje.classList.remove('exito', 'error');
  
    try {
      const response = await fetch('/api/monedas/actualizar-dolar', {
        method: 'POST'
      });
  
      const data = await response.json();
  
      if (data.ok) {
        mensaje.textContent = `✅ Dólar actualizado correctamente: $${data.valorUSD}`;
        mensaje.classList.add('exito');
      } else {
        mensaje.textContent = `❌ ${data.msg}`;
        mensaje.classList.add('error');
      }
    } catch (error) {
      mensaje.textContent = '❌ Error de conexión con el servidor.';
      mensaje.classList.add('error');
    }
  
    mensaje.classList.remove('oculto');
  });