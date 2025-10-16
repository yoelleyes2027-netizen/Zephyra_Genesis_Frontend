document.getElementById('formBuscar').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const documento = document.getElementById('documentoBuscar').value;
    const mensajeEl = document.getElementById('mensaje');
  
    try {
      const response = await fetch(`/api/proveedores/buscar/${documento}`, {
        credentials: 'include'
      });
  
      if (!response.ok) throw new Error('Proveedor no encontrado');
  
      const respuesta = await response.json();
      const proveedor = respuesta.data;
  
      document.getElementById('nombre').textContent = proveedor.nombre;
      document.getElementById('email').textContent = proveedor.email || 'N/A';
      document.getElementById('telefono').textContent = proveedor.telefono || 'N/A';
      document.getElementById('direccion').textContent = proveedor.direccion || 'N/A';
      document.getElementById('documento').textContent = proveedor.documento;
  
      document.getElementById('proveedorInfo').style.display = 'block';
      document.getElementById('boton-eliminar-proveedor').style.display = 'block';
      mensajeEl.textContent = '';
    } catch (error) {
      mensajeEl.textContent = 'Proveedor no encontrado';
      mensajeEl.style.color = 'red';
      document.getElementById('proveedorInfo').style.display = 'none';
    }
  });
  
  document.getElementById('btnEliminar').addEventListener('click', async function () {
    const documento = document.getElementById('documento').textContent;
    const mensajeEl = document.getElementById('mensaje');
  
    if (!confirm(`¿Estás seguro que deseas eliminar al proveedor con documento ${documento}?`)) return;
  
    try {
      const response = await fetch(`/api/proveedores/desactivar/${documento}`, {
        method: 'PUT',
        credentials: 'include'
      });
  
      const result = await response.json();
  
      if (response.ok) {
        mensajeEl.textContent = result.mensaje;
        mensajeEl.style.color = 'green';
        document.getElementById('proveedorInfo').style.display = 'none';
      } else {
        mensajeEl.textContent = result.mensaje || 'Error al eliminar el proveedor';
        mensajeEl.style.color = 'red';
      }
  
    } catch (error) {
      mensajeEl.textContent = 'Error inesperado al eliminar';
      mensajeEl.style.color = 'red';
    }
  });