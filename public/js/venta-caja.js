let productosSeleccionados = [];
let total = 0;

const form = document.getElementById('producto-form');
const tablaBody = document.querySelector('#tabla-productos tbody');
const totalSpan = document.getElementById('total');

//Logica de buscador de productos
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
let tipo_ticket = 'VENTA';

// 1. Mostrar modal de forma de pago
document.getElementById('cerrar-ticket').addEventListener('click', () => {
  // ⚠️ Validar si hay productos
  if (productosSeleccionados.length === 0) {
    alert("⚠️ No hay productos en el ticket.");
    return;
  }
  // Mostrar el selector de forma de pago y ocultar boton
  document.getElementById('modal-forma-pago').style.display = 'block';
  document.getElementById('cerrar-ticket').style.display = 'none';
  document.getElementById('producto-form').style.display = 'none';
});

// V1. Volver a agregar productos
document.getElementById('volver-agregar-productos').addEventListener('click', () => {
  document.getElementById('modal-forma-pago').style.display = 'none';
  document.getElementById('cerrar-ticket').style.display = 'block';
  document.getElementById('producto-form').style.display = 'block';
});

// 2. Confirmar forma de pago y mostrar siguiente modal
document.getElementById('confirmar-forma-pago').addEventListener('click', () => {
  formaPagoSeleccionada = document.getElementById('forma-pago').value;
  document.getElementById('modal-forma-pago').style.display = 'none';
  document.getElementById('modal-comprobante').style.display = 'block';
});

// V2. Volver a forma de pago
document.getElementById('volver-forma-pago').addEventListener('click', () => {
  document.getElementById('modal-forma-pago').style.display = 'block';
  document.getElementById('modal-comprobante').style.display = 'none';
});

// 3. Confirmar tipo de comprobante y mostrar siguiente modal
document.getElementById('confirmar-comprobante').addEventListener('click', () => {
  tipoComprobanteSeleccionado = document.getElementById('tipo-comprobante').value;
  document.getElementById('modal-comprobante').style.display = 'none';

  // Si es factura con RUT, mostramos el modal para buscar cliente
  if (tipoComprobanteSeleccionado === '111') {
    document.getElementById('modal-cliente').style.display = 'block';
  } else {
    document.getElementById('ticket-info').style.display = 'block';
  }
});

// 3.1 confirmar cliente y contuniuar con tipo de pago
document.getElementById('confirmar-cliente').addEventListener('click', () => {
  document.getElementById('modal-cliente').style.display = 'none';
  document.getElementById('ticket-info').style.display = 'block';
});

// V3.1 Volver a tipo de comprobante desde cliente con rut
document.getElementById('volver-tipo-comprobante').addEventListener('click', () => {
  document.getElementById('modal-comprobante').style.display = 'block';
  document.getElementById('modal-cliente').style.display = 'none';
});

// V3.1 Volver a tipo de comprobante desde moneda
document.getElementById('volver-tipo-comprobante-moneda').addEventListener('click', () => {
  document.getElementById('modal-comprobante').style.display = 'block';
  document.getElementById('ticket-info').style.display = 'none';
});

// 4. confirmar tipo de pago
document.getElementById('confirmar-tipo-pago').addEventListener('click', () => {
  document.getElementById('modal-moneda').style.display = 'block';
  document.getElementById('ticket-info').style.display = 'none';
});

// V4. Volver a tipo de pago
document.getElementById('volver-tipo-pago').addEventListener('click', () => {
  document.getElementById('ticket-info').style.display = 'block';
  document.getElementById('modal-moneda').style.display = 'none';
});


// Llamada para encontrar el cliente por documento
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
    document.getElementById('buscar-cliente').style.display = 'none'
  } catch (err) {
    mensaje.textContent = "❌ Cliente no registrado.";
    mensaje.style.display = 'block';
  }
});

// Detectar si corresponde mostrar campo de pago en efectivo
const tipoPagoInput = document.getElementById('tipo-pago');
const monedaInput = document.getElementById('moneda');
const pagoEfectivoContainer = document.getElementById('pago-efectivo-container');
const montoPagadoInput = document.getElementById('monto-pagado');
const montoCambioSpan = document.getElementById('monto-cambio');

// --- USD helpers / elementos ---
let tasaUSD = null;         // $UYU por 1 USD (desde backend)
let totalUSD = 0;           // total del ticket expresado en USD

const modalPagoUsd = document.getElementById('modal-pago-efectivo-usd-container');
const montoPagadoUsdInput = document.getElementById('monto-pagado-usd');
const tasaUsdSpan = document.getElementById('tasa-usd');
const totalUsdSpan = document.getElementById('total-usd');
const cambioUsdSpan = document.getElementById('monto-cambio-usd');

// Calcular cambio automáticamente
montoPagadoInput.addEventListener('input', () => {
  const montoPagado = parseFloat(montoPagadoInput.value) || 0;
  const cambio = montoPagado - total;
  montoCambioSpan.textContent = cambio > 0 ? cambio.toFixed(2) : '0.00';
});

if (montoPagadoUsdInput) {
  montoPagadoUsdInput.addEventListener('input', () => {
    const monto = parseFloat(montoPagadoUsdInput.value) || 0;
    const cambioUSD = monto - totalUSD;
    const cambioUSDPositivo = cambioUSD > 0 ? cambioUSD : 0;

    // 🔹 Mostrar cambio en dólares (como antes)
    cambioUsdSpan.textContent = cambioUSDPositivo.toFixed(2);

    // 🔹 Nuevo: calcular cambio en pesos uruguayos
    const cambioUYU = cambioUSDPositivo * tasaUSD;
    const cambioUYUSpan = document.getElementById('monto-cambio-uyu-usd');
    cambioUYUSpan.textContent = cambioUYU.toFixed(2);
  });
}

// Llamada para saber el dolar hoy
async function obtenerTasaUSD() {
  // Cacheamos en memoria para no llamar dos veces
  if (tasaUSD) return tasaUSD;

  const res = await fetch('/api/monedas/USD', { credentials: 'include' });
  if (!res.ok) throw new Error('No se pudo obtener la tasa USD.');
  const data = await res.json();

  // El backend devuelve { ok, codigo, nombre, valor_en_pesos, ... }
  tasaUSD = Number(data.valor_en_pesos);
  return tasaUSD;
}

// 5. Confirmar moneda y enviar ticket al backend
document.getElementById('confirmar-moneda').addEventListener('click', async () => {
  monedaSeleccionada = document.getElementById('moneda').value;
  const tipo_pago = document.getElementById('tipo-pago').value;

  // si paga con efectivo mostrar calculadora de cambio (UYU)
  if (tipo_pago === 'efectivo' && monedaSeleccionada === 'UYU') {
    document.getElementById('modal-pago-efectivo-container').style.display = 'block';
    document.getElementById('modal-moneda').style.display = 'none';

  // 🔹 NUEVO: efectivo + USD
  } else if (tipo_pago === 'efectivo' && monedaSeleccionada === 'USD') {
    try {
      const tasa = await obtenerTasaUSD(); // p.ej. 39.8267 UYU por 1 USD
      tasaUsdSpan.textContent = tasa.toFixed(2);

      // El total que llevás está en UYU => lo convertimos a USD solo para mostrar/cobrar
      totalUSD = total / tasa;
      totalUsdSpan.textContent = totalUSD.toFixed(2);
      cambioUsdSpan.textContent = '0.00';
      montoPagadoUsdInput.value = '';

      modalPagoUsd.style.display = 'block';
      document.getElementById('modal-moneda').style.display = 'none';
    } catch (err) {
      alert('❌ ' + err.message);
    }

  } else {
    // ⚙️ Flujo normal (tarjeta / crédito / etc.) -> crear ticket y actualizar stock
    const body = {
      cliente_id,
      tipo_pago,
      forma_pago: formaPagoSeleccionada,
      tipo_comprobante: tipoComprobanteSeleccionado,
      moneda: monedaSeleccionada,
      total,
      tipo_ticket,
      productos: productosSeleccionados
    };

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error al guardar ticket');

      const actualizarStock = await fetch('/api/productos/actualizar-stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productos: productosSeleccionados })
      });
      if (!actualizarStock.ok) throw new Error('Error al actualizar stock');

      alert('✅ Ticket generado y stock actualizado correctamente');
      location.reload();
    } catch (err) {
      console.error(err);
      alert('❌ ' + err.message);
    }
  }
});

// 6.1 Ocultar el último modal con UYU
document.getElementById('finalizar').addEventListener('click', async () => {
  monedaSeleccionada = document.getElementById('moneda').value;

  const tipo_pago = document.getElementById('tipo-pago').value;

  const body = {
    cliente_id,
    tipo_pago,
    forma_pago: formaPagoSeleccionada,
    tipo_comprobante: tipoComprobanteSeleccionado,
    moneda: monedaSeleccionada,
    total,
    tipo_ticket: tipo_ticket,
    productos: productosSeleccionados
  };

  try {

    if (!(await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    })).ok) throw new Error('Error al guardar ticket');

    // Si el ticket se generó correctamente, actualizar el stock
    const actualizarStock = await fetch('/api/productos/actualizar-stock', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ productos: productosSeleccionados })
    });

    if (!actualizarStock.ok) throw new Error('Error al actualizar stock');

    // Mensaje final
    alert('✅ Ticket generado y stock actualizado correctamente');
    location.reload();

  } catch (err) {
    console.error(err);
    alert('❌ ' + err.message);
  }
});

// 6.2 Ocultar el ultimo modal con USD
document.getElementById('finalizar-usd').addEventListener('click', async () => {
  const tipo_pago = document.getElementById('tipo-pago').value; // 'efectivo'
  const body = {
    cliente_id,
    tipo_pago,
    forma_pago: formaPagoSeleccionada,
    tipo_comprobante: tipoComprobanteSeleccionado,
    moneda: 'USD',                 // 👈 la moneda del ticket
    total,                         // 👈 mantenemos tu total en UYU (como venías)
    tipo_ticket,
    productos: productosSeleccionados,
    tasa_USD: tasaUSD
  };

  try {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Error al guardar ticket');

    const actualizarStock = await fetch('/api/productos/actualizar-stock', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productos: productosSeleccionados })
    });
    if (!actualizarStock.ok) throw new Error('Error al actualizar stock');

    alert('✅ Ticket generado y stock actualizado correctamente');
    location.reload();
  } catch (err) {
    console.error(err);
    alert('❌ ' + err.message);
  }
});

//Logica de teclado con los modales
document.addEventListener('keydown', function (e) {
  const currentModal = document.querySelector('.modal[style*="block"]');
  if (!currentModal) return;

  // 🔍 Caso especial: modal-cliente (no tiene opciones navegables)
  if (currentModal.id === 'modal-cliente') {
    if (e.key === 'Enter') {
      e.preventDefault();

      // 🔍 Buscar botón visible (buscar-cliente o confirmar-cliente)
      const buscarBtn = currentModal.querySelector('#buscar-cliente');
      const confirmarBtn = currentModal.querySelector('#confirmar-cliente');

      if (buscarBtn && buscarBtn.style.display !== 'none') {
        buscarBtn.click();
      } else if (confirmarBtn && confirmarBtn.style.display !== 'none') {
        confirmarBtn.click();
      }
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const volverBtn = currentModal.querySelector('#volver-tipo-comprobante');
      if (volverBtn) volverBtn.click();
    }

    return; // ⚠️ Salimos para no seguir con el resto de lógica
  }

  // 🔁 Modales con lista de opciones
  const opcionesContainer = currentModal.querySelector('.opciones');
  if (!opcionesContainer) return;

  const opciones = Array.from(opcionesContainer.querySelectorAll('.opcion'));
  let selectedIndex = opciones.findIndex(opt => opt.classList.contains('selected'));

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (selectedIndex < opciones.length - 1) {
      opciones[selectedIndex].classList.remove('selected');
      opciones[++selectedIndex].classList.add('selected');
    }
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (selectedIndex > 0) {
      opciones[selectedIndex].classList.remove('selected');
      opciones[--selectedIndex].classList.add('selected');
    }
  }

  if (e.key === 'Enter') {
    e.preventDefault();

    const selectedOption = opciones[selectedIndex];
    const inputId = opcionesContainer.dataset.inputId;
    if (inputId && selectedOption) {
      const input = document.getElementById(inputId);
      input.value = selectedOption.dataset.value;
    }

    const confirmarBtn = currentModal.querySelector('button[id^="confirmar-"]');
    if (confirmarBtn) confirmarBtn.click();
  }

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    const volverBtn = currentModal.querySelector('button[id^="volver-"]');
    if (volverBtn) volverBtn.click();
  }
});