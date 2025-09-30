let productosSeleccionados = [];
let total = 0;

const form = document.getElementById('producto-form');
const tablaBody = document.querySelector('#tabla-productos tbody');
const totalSpan = document.getElementById('total');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const codigo = document.getElementById('codigo').value;
  const cantidad = parseInt(document.getElementById('cantidad').value);

  try {
    const res = await fetch(`/api/productos/${codigo}`, {
      credentials: 'include',
    });

    if (!res.ok) throw new Error('Producto no encontrado');

    const producto = await res.json();
    const subtotal = producto.precio_venta * cantidad;
    total += subtotal;

    const productoInfo = {
      producto_id: producto.id,
      cantidad,
      precio_unitario: producto.precio_venta,
      subtotal,
    };

    productosSeleccionados.push(productoInfo);

    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${producto.descripcion}</td>
      <td>$${producto.precio_venta}</td>
      <td>${cantidad}</td>
      <td>$${subtotal.toFixed(2)}</td>
      <td><button class="eliminar-producto" data-id="${producto.id}">🗑️</button></td>
    `;

    tablaBody.appendChild(fila);

    // ✅ Asignar el evento al botón "eliminar" ya insertado en DOM
    fila.querySelector('.eliminar-producto').addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);

      // Buscar el índice del producto con ese ID
      const index = productosSeleccionados.findIndex(p => p.producto_id === id);
      if (index !== -1) {
        total -= productosSeleccionados[index].subtotal;
        productosSeleccionados.splice(index, 1);
        fila.remove();
        totalSpan.textContent = total.toFixed(2);
      }
    });

    totalSpan.textContent = total.toFixed(2);
    form.reset();
    document.getElementById('cantidad').value = 1;

  } catch (err) {
    alert(err.message);
  }
});

let formaPagoSeleccionada = 'contado';
let tipoComprobanteSeleccionado = '101';
let monedaSeleccionada = 'UYU';
let cliente_id = 1; // ahora lo vamos a actualizar dinámicamente

// 1. Mostrar modal de forma de pago
document.getElementById('cerrar-ticket').addEventListener('click', () => {
  // ⚠️ Validar si hay productos
  if (productosSeleccionados.length === 0) {
    alert("⚠️ No hay productos en el ticket.");
    return;
  }

  // Mostrar el primer modal del flujo
  document.getElementById('ticket-info').style.display = 'none';
  document.getElementById('modal-forma-pago').style.display = 'block';
});

// 2. Confirmar tipo de pago y mostrar siguiente modal
document.getElementById('confirmar-tipo-pago').addEventListener('click', () => {
  document.getElementById('ticket-info').style.display = 'none';
  document.getElementById('modal-forma-pago').style.display = 'block';
});

// 3. Confirmar forma de pago y mostrar siguiente modal
document.getElementById('confirmar-forma-pago').addEventListener('click', () => {
  formaPagoSeleccionada = document.getElementById('forma-pago').value;
  document.getElementById('modal-forma-pago').style.display = 'none';
  document.getElementById('modal-comprobante').style.display = 'block';
});

// 4. Confirmar tipo de comprobante y mostrar siguiente modal
document.getElementById('confirmar-comprobante').addEventListener('click', () => {
  tipoComprobanteSeleccionado = document.getElementById('tipo-comprobante').value;
  document.getElementById('modal-comprobante').style.display = 'none';

  // Si es factura con RUT, mostramos el modal para buscar cliente
  if (tipoComprobanteSeleccionado === '111') {
    document.getElementById('modal-cliente').style.display = 'block';
  } else {
    document.getElementById('modal-moneda').style.display = 'block';
  }
});

// 4.1 confirmar cliente y contuniuar con moneda
document.getElementById('confirmar-cliente').addEventListener('click', () => {
  document.getElementById('modal-cliente').style.display = 'none';
  document.getElementById('modal-moneda').style.display = 'block';
});


document.getElementById('buscar-cliente').addEventListener('click', async () => {
  const documento = document.getElementById('documento-cliente').value.trim();
  const mensaje = document.getElementById('mensaje-cliente');
  const confirmBtn = document.getElementById('confirmar-cliente');
  const infoCliente = document.getElementById('cliente-encontrado');
  const denominacionSpan = document.getElementById('cliente-denominacion');

  mensaje.style.display = 'none';
  confirmBtn.style.display = 'none';
  infoCliente.style.display = 'none';

  if (!documento) {
    mensaje.textContent = "⚠️ Ingresá un documento válido.";
    mensaje.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`/api/clientes/buscar/${documento}`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!res.ok) throw new Error("Cliente no encontrado");

    const cliente = await res.json();
    cliente_id = cliente.id; // ✅ actualizar el id a enviar
    denominacionSpan.textContent = cliente.denominacion;
    infoCliente.style.display = 'block';
    confirmBtn.style.display = 'inline-block';
  } catch (err) {
    mensaje.textContent = "❌ Cliente no registrado.";
    mensaje.style.display = 'block';
  }
});

// 5. Confirmar moneda y enviar ticket al backend
document.getElementById('confirmar-moneda').addEventListener('click', async () => {
  monedaSeleccionada = document.getElementById('moneda').value;

  const tipo_pago = document.getElementById('tipo-pago').value;

  const body = {
    cliente_id,
    tipo_pago,
    forma_pago: formaPagoSeleccionada,
    tipo_comprobante: tipoComprobanteSeleccionado,
    moneda: monedaSeleccionada,
    total,
    productos: productosSeleccionados
  };

  try {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error('Error al guardar ticket');
    alert('✅ Ticket generado correctamente');
    location.reload();
  } catch (err) {
    console.error(err);
    alert('❌ ' + err.message);
  }

  // Ocultar el último modal
  document.getElementById('modal-moneda').style.display = 'none';
});