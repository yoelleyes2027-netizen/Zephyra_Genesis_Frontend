document.getElementById('formBuscar').addEventListener('submit', async function (e) {
    e.preventDefault();
    const codigo = document.getElementById('codigoBuscar').value;
    const mensajeEl = document.getElementById('mensaje');
  
    try {
      const response = await fetch(`/api/productos/${codigo}`, {
        credentials: 'include'
      });
  
      if (!response.ok) throw new Error('Producto no encontrado');
  
      const producto = await response.json();
  
      document.getElementById('codigo').textContent = producto.codigo;
      document.getElementById('descripcion').textContent = producto.descripcion;
      document.getElementById('precio_venta').textContent = producto.precio_venta;
      document.getElementById('precio_compra').textContent = producto.precio_compra;
      document.getElementById('stock').textContent = producto.stock;
      document.getElementById('unidad_medida').textContent = producto.unidad_medida;
      document.getElementById('etiqueta').textContent = producto.etiqueta || 'N/A';
      document.getElementById('proveedor').textContent = producto.proveedor || 'N/A';
      document.getElementById('cod_barra').textContent = producto.cod_barra || 'N/A';
  
      document.getElementById('productoInfo').style.display = 'block';
      document.getElementById('boton-eliminar-producto').style.display = 'block';
      mensajeEl.textContent = '';
    } catch (error) {
      mensajeEl.textContent = 'Producto no encontrado';
      mensajeEl.style.color = 'red';
      document.getElementById('productoInfo').style.display = 'none';
    }
  });
  
  document.getElementById('btnEliminar').addEventListener('click', async function () {
    const codigo = document.getElementById('codigo').textContent;
    const mensajeEl = document.getElementById('mensaje');
  
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
        document.getElementById('productoInfo').style.display = 'none';
      } else {
        mensajeEl.textContent = result.mensaje || 'Error al eliminar el producto';
        mensajeEl.style.color = 'red';
      }
    } catch (error) {
      mensajeEl.textContent = 'Error inesperado al eliminar';
      mensajeEl.style.color = 'red';
    }
  });
  