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

document.getElementById('cerrar-ticket').addEventListener('click', async () => {
  const tipo_pago = document.getElementById('tipo-pago').value;
  const cliente_id = 1; // O podrías tener un input más adelante para elegir cliente

  const body = {
    cliente_id,
    tipo_pago,
    total,
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
    alert('✅ Ticket generado correctamente');
    location.reload();
  } catch (err) {
    console.error(err);
    alert('❌ ' + err.message);
  }
});