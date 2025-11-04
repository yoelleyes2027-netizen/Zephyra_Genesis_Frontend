document.getElementById('formBuscar').addEventListener('submit', async (e) => {
  e.preventDefault();

  const codigo = document.getElementById('codigoBuscar').value.trim();
  const mensajeEl = document.getElementById('mensaje');
  const panelInfo = document.getElementById('productoInfo');
  const panelBoton = document.getElementById('boton-eliminar-producto');

  // helpers para manejar !important
  const mostrar = (el) => el.style.setProperty('display', 'block', 'important');
  const ocultar = (el) => el.style.setProperty('display', 'none', 'important');

  // limpiar mensaje y ocultar todo al iniciar
  mensajeEl.textContent = '';
  mensajeEl.removeAttribute('style');
  ocultar(panelInfo);
  ocultar(panelBoton);

  // limpia los spans del panel (evita que queden datos viejos)
  const limpiarCampos = () => {
    ['codigo', 'descripcion', 'precio_venta', 'precio_compra', 'stock', 'unidad_medida', 'etiqueta', 'proveedor', 'cod_barra']
      .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
  };
  limpiarCampos();

  if (!codigo) {
    mensajeEl.textContent = 'Ingresá un código válido.';
    mensajeEl.style.color = 'red';
    return;
  }

  try {
    const response = await fetch(`/api/productos/${encodeURIComponent(codigo)}`, {
      credentials: 'include'
    });

    if (response.ok) {
      // ✅ encontrado
      const producto = await response.json();

      document.getElementById('codigo').textContent = producto.codigo ?? '';
      document.getElementById('descripcion').textContent = producto.descripcion ?? '';
      document.getElementById('precio_venta').textContent = producto.precio_venta ?? '';
      document.getElementById('precio_compra').textContent = producto.precio_compra ?? '';
      document.getElementById('stock').textContent = producto.stock ?? '';
      document.getElementById('unidad_medida').textContent = producto.unidad_medida ?? '';
      document.getElementById('etiqueta').textContent = producto.etiqueta ?? 'N/A';
      document.getElementById('proveedor').textContent = producto.proveedor ?? 'N/A';
      document.getElementById('cod_barra').textContent = producto.cod_barra ?? 'N/A';

      mostrar(panelInfo);
      mostrar(panelBoton);
      mensajeEl.textContent = '';
    } else {
      // ❌ no encontrado u otro 4xx/5xx
      let msg = 'Producto no encontrado';
      try {
        const err = await response.json();
        if (err?.mensaje) msg = err.mensaje;
      } catch { /* puede no tener body */ }

      mensajeEl.textContent = msg;
      mensajeEl.style.color = 'red';
      ocultar(panelInfo);
      ocultar(panelBoton);
      limpiarCampos();
    }
  } catch (err) {
    // 🌐 error de red
    mensajeEl.textContent = 'Error de conexión con el servidor.';
    mensajeEl.style.color = 'red';
    ocultar(panelInfo);
    ocultar(panelBoton);
    limpiarCampos();
  }
});



document.getElementById('btnEliminar').addEventListener('click', async function () {
  const codigo = document.getElementById('codigo').textContent;
  const mensajeEl = document.getElementById('mensaje');
  const panelInfo = document.getElementById('productoInfo');
  const panelboton = document.getElementById('boton-eliminar-producto');

  // helpers para manejar !important
  const ocultar = (el) => el.style.setProperty('display', 'none', 'important');

  if (!confirm(`¿Estás seguro que deseas eliminar el producto ${codigo}?`)) return;

  try {
    const response = await fetch(`/api/productos/${codigo}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const result = await response.json();

    if (response.ok) {
      mensajeEl.textContent = result.mensaje;
      mensajeEl.style.color = 'green';
      ocultar(panelInfo);
      ocultar(panelboton);

    } else {
      mensajeEl.textContent = result.mensaje || 'Error al eliminar el producto';
      mensajeEl.style.color = 'red';
    }
  } catch (error) {
    mensajeEl.textContent = 'Error inesperado al eliminar';
    mensajeEl.style.color = 'red';
  }
});
