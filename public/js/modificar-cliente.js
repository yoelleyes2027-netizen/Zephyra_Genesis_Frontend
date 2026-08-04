let clienteEmailOriginal = null;

// FORMULARIO DE BÚSQUEDA
document.getElementById('formBuscar').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const valorBusqueda = document.getElementById('documentoBuscar').value.trim();
    const mensajeEl = document.getElementById('mensaje');
  
    try {
      const response = await fetch(`/api/clientes/buscar/${encodeURIComponent(valorBusqueda)}`, {
        credentials: 'include'
      });
  
      if (!response.ok) {
        throw new Error('Cliente no encontrado');
      }
  
      const cliente = await response.json();
      clienteEmailOriginal = cliente.email || valorBusqueda;
  
      // Rellenar el formulario con los datos
      document.getElementById('nombre').value = cliente.name || '';
      document.getElementById('telefono').value = cliente.telefono || '';
      document.getElementById('email').value = cliente.email || '';
  
      document.getElementById('formModificar').style.display = 'block';
      mensajeEl.textContent = '';
    } catch (error) {
      console.error('Error:', error);
      mensajeEl.textContent = 'Cliente no encontrado.';
      mensajeEl.style.color = 'red';
    }
  });
  
  // FORMULARIO DE MODIFICACIÓN
  document.getElementById('formModificar').addEventListener('submit', async function (e) {
    e.preventDefault();
  
      const mensajeEl = document.getElementById('mensaje');
      const emailOriginal = clienteEmailOriginal || document.getElementById('documentoBuscar').value.trim();

      if (!emailOriginal) {
        mensajeEl.textContent = 'Número de documento inválido.';
        mensajeEl.style.color = 'red';
        return;
      }
  
    const datos = {
        name: document.getElementById('nombre').value,
        telefono: Number(document.getElementById('telefono').value || 0),
      email: document.getElementById('email').value,
    };
  
    // Eliminar campos vacíos o inválidos
    Object.keys(datos).forEach(key => {
      if (datos[key] === '' || datos[key] === null) {
        delete datos[key];
      }
    });
  
    try {
      const response = await fetch(`/api/clientes/${encodeURIComponent(emailOriginal)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(datos)
      });
  
      const resultado = await response.json();
  
      if (response.ok) {
        mensajeEl.textContent = resultado.mensaje;
        mensajeEl.style.color = 'green';
        clienteEmailOriginal = datos.email || emailOriginal;
      } else {
        mensajeEl.textContent = resultado.mensaje || 'Error al actualizar';
        mensajeEl.style.color = 'red';
      }
    } catch (error) {
      console.error('Error:', error);
      mensajeEl.textContent = 'Error inesperado.';
      mensajeEl.style.color = 'red';
    }
  });