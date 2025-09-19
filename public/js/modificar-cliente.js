// FORMULARIO DE BÚSQUEDA
document.getElementById('formBuscar').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const numeroDoc = document.getElementById('documentoBuscar').value;
    const mensajeEl = document.getElementById('mensaje');
  
    try {
      const response = await fetch(`/api/clientes/buscar/${numeroDoc}`, {
        credentials: 'include'
      });
  
      if (!response.ok) {
        throw new Error('Cliente no encontrado');
      }
  
      const cliente = await response.json();
  
      // Rellenar el formulario con los datos
      document.getElementById('nombre').value = cliente.nombre || '';
      document.getElementById('telefono').value = cliente.telefono || '';
      document.getElementById('email').value = cliente.email || '';
      document.getElementById('direccion').value = cliente.direccion || '';
  
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
  
    const numeroDoc = document.getElementById('documentoBuscar').value;

    if (!numeroDoc || typeof numeroDoc !== 'string' || !numeroDoc.trim()) {
        mensajeEl.textContent = 'Número de documento inválido.';
        mensajeEl.style.color = 'red';
        return;
      }
  
    const datos = {
      nombre: document.getElementById('nombre').value,
      telefono: document.getElementById('telefono').value,
      email: document.getElementById('email').value,
      direccion: document.getElementById('direccion').value
    };
  
    // Eliminar campos vacíos o inválidos
    Object.keys(datos).forEach(key => {
      if (datos[key] === '' || datos[key] === null) {
        delete datos[key];
      }
    });
  
    const mensajeEl = document.getElementById('mensaje');
  
    try {
      const response = await fetch(`/api/clientes/${numeroDoc}`, {
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