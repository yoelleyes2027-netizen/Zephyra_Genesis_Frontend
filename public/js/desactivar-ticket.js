document.getElementById('btn-desactivar').addEventListener('click', async () => {
    const ticketIdInput = document.getElementById('ticket-id');
    const mensaje = document.getElementById('mensaje');
    const ticket_id = ticketIdInput.value.trim();
  
    mensaje.textContent = '';
    mensaje.className = 'mensaje';
  
    if (!ticket_id || isNaN(ticket_id)) {
      mensaje.textContent = '⚠️ Ingrese un número de ticket válido.';
      mensaje.classList.add('error');
      return;
    }
  
    try {
      const response = await fetch('/api/tickets/desactivar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // por si usás cookies con JWT
        body: JSON.stringify({ ticket_id: parseInt(ticket_id) })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        mensaje.textContent = '✅ Ticket anulado correctamente.';
        mensaje.classList.add('exito');
        ticketIdInput.value = '';
      } else {
        mensaje.textContent = `❌ ${data.mensaje || 'Error al anular el ticket.'}`;
        mensaje.classList.add('error');
      }
    } catch (error) {
      mensaje.textContent = '❌ Error de conexión con el servidor.';
      mensaje.classList.add('error');
    }
  });