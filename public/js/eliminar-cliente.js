let clienteEmailOriginal = null;

document.getElementById('formBuscar').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const documento = document.getElementById('documentoBuscar').value.trim();
    const mensajeEl = document.getElementById('mensaje');
  
    try {
      const response = await fetch(`/api/clientes/buscar/${encodeURIComponent(documento)}`, {
        credentials: 'include'
      });
  
      if (!response.ok) throw new Error('Cliente no encontrado');
  
      const cliente = await response.json();
      clienteEmailOriginal = cliente.email || documento;
  
      document.getElementById('nombre').textContent = cliente.name;
      document.getElementById('telefono').textContent = cliente.telefono || 'N/A';
      document.getElementById('email').textContent = cliente.email || 'N/A';
  
      document.getElementById('clienteInfo').style.display = 'block';
      document.getElementById('boton-eliminar-cliente').style.display = 'block';
      mensajeEl.textContent = '';
    } catch (error) {
      mensajeEl.textContent = 'Cliente no encontrado';
      mensajeEl.style.color = 'red';
      document.getElementById('clienteInfo').style.display = 'none';
    }
  });
  
  document.getElementById('btnEliminar').addEventListener('click', async function () {
    const documento = clienteEmailOriginal || document.getElementById('email').textContent;
    const mensajeEl = document.getElementById('mensaje');
  
    if (!confirm(`¿Estás seguro que deseas eliminar al cliente ${documento}?`)) return;
  
    try {
      const response = await fetch(`/api/clientes/desactivar/${encodeURIComponent(documento)}`, {
        method: 'PUT',
        credentials: 'include'
      });
  
      const result = await response.json();
  
      if (response.ok) {
        mensajeEl.textContent = result.mensaje;
        mensajeEl.style.color = 'green';
        document.getElementById('clienteInfo').style.display = 'none';
      } else {
        mensajeEl.textContent = result.mensaje || 'Error al eliminar el cliente';
        mensajeEl.style.color = 'red';
      }
    } catch (error) {
      mensajeEl.textContent = 'Error inesperado al eliminar';
      mensajeEl.style.color = 'red';
    }
  });
