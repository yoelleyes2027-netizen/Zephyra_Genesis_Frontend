document.getElementById('btn-buscar').addEventListener('click', buscarTicket);
document.getElementById('ticket-id').addEventListener('keydown', e => {
  if (e.key === 'Enter') buscarTicket();
});

let clienteIdBuscado = null;
let tipoPagoBuscado = null;
let tipoComprobanteBuscado = null;

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
      // Mensaje específico cuando el ticket está inactivo
      if (response.status === 404 && data.mensaje.includes('inactivo')) {
        mensaje.textContent = '❌ Este ticket ya fue devuelto o no está disponible.';
      } else {
        mensaje.textContent = `❌ ${data.mensaje || 'Ticket no encontrado.'}`;
      }
      mensaje.classList.add('error');
      return;
    }

    clienteIdBuscado = data.ticket.cliente_id;
    tipoPagoBuscado = data.ticket.tipo_pago;
    tipoComprobanteBuscado = data.ticket.tipo_comprobante;

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
    document.getElementById('Tipo-ticket-label').textContent = data.ticket.tipo_ticket;

    // Vaciar y volver a llenar la tabla
    const tablaBody = document.getElementById('articulos-body');
    tablaBody.innerHTML = '';

    // Agregar productos
    data.productos.forEach(producto => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
    <td>${producto.descripcion}</td>
    <td>${producto.cantidad}</td>
    <td>$${producto.precio_unitario}</td>
    <td>
      <input type="checkbox" 
       class="checkbox-articulo" 
       value="${producto.id}" 
       data-producto-id="${producto.producto_id}">
    </td>
  `;
      tablaBody.appendChild(tr);
    });

    // 👉 Función global para verificar checkboxes
    function verificarCheckboxesSeleccionados() {
      const algunoSeleccionado = document.querySelectorAll('.checkbox-articulo:checked').length > 0;
      const btnEliminar = document.getElementById('btn-eliminar-seleccionados');
      btnEliminar.style.display = algunoSeleccionado ? 'block' : 'none';
    }

    // 🔁 Asignar eventos una vez luego de renderizar todo
    const checkboxes = document.querySelectorAll('.checkbox-articulo');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', verificarCheckboxesSeleccionados);
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
      await crearTicketDevolucion();
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
document.getElementById('btn-eliminar-seleccionados').addEventListener('click', async () => {
  const checkboxes = document.querySelectorAll('.checkbox-articulo:checked');
  const detallesIdsSeleccionados = Array.from(checkboxes).map(cb => parseInt(cb.value));

  if (detallesIdsSeleccionados.length === 0) {
    alert("No seleccionaste ningún artículo.");
    return;
  }

  const payload = {
    detalles_ids: detallesIdsSeleccionados
  };

  try {
    const res = await fetch('/api/tickets/eliminar-articulos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      // ✅ Generar ticket de devolución con los artículos seleccionados
      await crearTicketDevolucionDesdeSeleccionados();

      alert("✅ Artículos eliminados correctamente.");
      location.reload();
    } else {
      alert("❌ Error al eliminar artículos.");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error al conectar con el servidor.");
  }
});

// Generar el ticket de devolución completo
async function crearTicketDevolucion() {
  try {
    // Datos ya cargados en pantalla
    const cliente_id = clienteIdBuscado;
    const tipo_pago = tipoPagoBuscado;
    const forma_pago = document.getElementById('forma-label').textContent.trim();
    const tipo_comprobante = tipoComprobanteBuscado;
    const moneda = document.getElementById('moneda-label').textContent.trim();

    // Recolectar productos desde la tabla ya mostrada
    const tablaBody = document.getElementById('articulos-body');
    const filas = tablaBody.querySelectorAll('tr');

    const productos = Array.from(filas).map(fila => {
      const celdas = fila.querySelectorAll('td');
      const checkbox = fila.querySelector('.checkbox-articulo');

      return {
        producto_id: parseInt(checkbox?.dataset.productoId || 0),
        descripcion: celdas[0].textContent.trim(),
        cantidad: parseInt(celdas[1].textContent.trim()),
        precio_unitario: parseFloat(celdas[2].textContent.replace('$', '').trim()),
        codigo: celdas[3]?.textContent.trim() || null // opcional
      };
    });

    // Calcular total
    const total = productos.reduce((acc, p) => acc + (p.precio_unitario * p.cantidad), 0);

    const payload = {
      cliente_id,
      tipo_pago,
      forma_pago,
      tipo_comprobante,
      moneda,
      total,
      tipo_ticket: 'devolucion',
      productos
    };

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // esto manda el token en la cookie
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('No se pudo generar el ticket de devolución');
    alert('✅ Ticket de devolución generado correctamente');

  } catch (err) {
    console.error(err);
    alert('❌ ' + err.message);
  }
}

// Generar tiket de devolucion con los articulos seleccionados
async function crearTicketDevolucionDesdeSeleccionados() {
  try {
    const cliente_id = clienteIdBuscado;
    const tipo_pago = tipoPagoBuscado;
    const forma_pago = document.getElementById('forma-label').textContent.trim();
    const tipo_comprobante = tipoComprobanteBuscado;
    const moneda = document.getElementById('moneda-label').textContent.trim();

    const tablaBody = document.getElementById('articulos-body');
    const filas = tablaBody.querySelectorAll('tr');

    const productos = Array.from(filas).map((fila) => {
      const checkbox = fila.querySelector('.checkbox-articulo');
      if (!checkbox || !checkbox.checked) return null;

      const detalle_id = parseInt(checkbox.value);
      const producto_id = parseInt(checkbox.dataset.productoId);

      const celdas = fila.querySelectorAll('td');

      return {
        id: detalle_id,
        producto_id: producto_id,
        descripcion: celdas[0].textContent.trim(),
        cantidad: parseInt(celdas[1].textContent.trim()),
        precio_unitario: parseFloat(celdas[2].textContent.replace('$', '').trim())
      };
    }).filter(p => p !== null);

    if (productos.length === 0) {
      alert("❌ No seleccionaste ningún artículo para devolver.");
      return;
    }

    const total = productos.reduce((acc, p) => acc + (p.precio_unitario * p.cantidad), 0);

    const payload = {
      cliente_id,
      tipo_pago,
      forma_pago,
      tipo_comprobante,
      moneda,
      total,
      tipo_ticket: 'devolucion',
      productos
    };

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('No se pudo generar el ticket de devolución');
    alert('✅ Ticket de devolución generado correctamente');
    location.reload();

  } catch (err) {
    console.error(err);
    alert('❌ ' + err.message);
  }
}