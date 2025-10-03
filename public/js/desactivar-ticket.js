document.getElementById('btn-buscar').addEventListener('click', buscarTicket);
document.getElementById('ticket-id').addEventListener('keydown', e => {
  if (e.key === 'Enter') buscarTicket();
});

async function buscarTicket() {
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
    const response = await fetch(`/api/tickets/${ticket_id}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    console.log(data)

    if (!response.ok) {
      mensaje.textContent = `❌ ${data.mensaje || 'Ticket no encontrado.'}`;
      mensaje.classList.add('error');
      return;
    }

    // Mostrar datos del ticket

    // fecha formateada
    const fechaOriginal = data.ticket.creado_en;  // ← viene del backend
    const fecha = new Date(fechaOriginal);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
    const anio = fecha.getFullYear();

    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');

    const fechaFormateada = `${dia}/${mes}/${anio} ${horas}:${minutos}`;

    document.getElementById('ticket-id-label').textContent = data.ticket.id;
    document.getElementById('cliente-label').textContent = data.ticket.denominacion || 'N/A';
    document.getElementById('fecha-label').textContent = fechaFormateada;
    document.getElementById('total-label').textContent = data.ticket.total;
    document.getElementById('forma-label').textContent = data.ticket.forma_pago || 'N/A';
    document.getElementById('moneda-label').textContent = data.ticket.moneda || 'N/A';
    document.getElementById('tipo-label').textContent = data.ticket.tipo_pago || 'N/A';
    document.getElementById('usuario-label').textContent = data.ticket.usuario_nombre || 'N/A';
    document.getElementById('datos-ticket').style.display = 'block';

    // Mostrar lista de artículos
    const tablaBody = document.getElementById('articulos-body');
    tablaBody.innerHTML = '';

    data.productos.forEach(producto => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${producto.descripcion}</td>
        <td>${producto.cantidad}</td>
        <td>$${producto.precio_unitario}</td>
        <td>
          <input type="checkbox" class="checkbox-articulo" 
       value="${producto.id}">
        </td>
      `;

      const checkboxes = document.querySelectorAll('.checkbox-articulo');
      checkboxes.forEach(cb => {
        cb.addEventListener('change', verificarCheckboxesSeleccionados);
      });

      // Función para mostrar/ocultar el botón según selección
      function verificarCheckboxesSeleccionados() {
        const algunoSeleccionado = document.querySelectorAll('.checkbox-articulo:checked').length > 0;
        const btnEliminar = document.getElementById('btn-eliminar-seleccionados');
        btnEliminar.style.display = algunoSeleccionado ? 'block' : 'none';
      }

      // Asignar evento a cada checkbox
      checkboxes.forEach(cb => {
        cb.addEventListener('change', verificarCheckboxesSeleccionados);
      });

      tablaBody.appendChild(tr);
    });

    document.getElementById('lista-articulos').style.display = 'block';
    document.getElementById('btn-anular').style.display = 'block';

  } catch (error) {
    mensaje.textContent = '❌ Error de conexión con el servidor.';
    mensaje.classList.add('error');
  }
}

document.getElementById('btn-anular').addEventListener('click', async () => {
  const ticket_id = document.getElementById('ticket-id').value.trim();
  const mensaje = document.getElementById('mensaje');

  mensaje.textContent = '';
  mensaje.className = 'mensaje';

  try {
    const response = await fetch('/api/tickets/desactivar', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ ticket_id: parseInt(ticket_id) })
    });

    const data = await response.json();

    if (response.ok) {
      mensaje.textContent = '✅ Ticket anulado correctamente.';
      mensaje.classList.add('exito');
      document.getElementById('datos-ticket').style.display = 'none';
      document.getElementById('lista-articulos').style.display = 'none';
      document.getElementById('btn-anular').style.display = 'none';
    } else {
      mensaje.textContent = `❌ ${data.mensaje || 'Error al anular el ticket.'}`;
      mensaje.classList.add('error');
    }

  } catch (error) {
    mensaje.textContent = '❌ Error de conexión con el servidor.';
    mensaje.classList.add('error');
  }
});

//Eliminar artuculos de un tiket
document.getElementById('btn-eliminar-seleccionados').addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('.checkbox-articulo:checked');
  const detallesIdsSeleccionados = Array.from(checkboxes).map(cb => parseInt(cb.value));

  if (detallesIdsSeleccionados.length === 0) {
    alert("No seleccionaste ningún artículo.");
    return;
  }

  const payload = {
    detalles_ids: detallesIdsSeleccionados
  };

  console.log(payload);

  fetch('/api/tickets/eliminar-articulos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Artículos eliminados correctamente.");
      location.reload();
    } else {
      alert("Error al eliminar artículos.");
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error al conectar con el servidor.");
  });
});