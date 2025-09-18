document.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch('/api/clientes', {
        method: 'GET',
        credentials: 'include' // incluye cookies
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error('Error desde backend:', result);
        return;
      }
  
      const clientes = result; // <-- aquí el cambio
      const tbody = document.getElementById('tabla-clientes-body');
      tbody.innerHTML = '';
  
      clientes.forEach(cliente => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${cliente.id}</td>
          <td>${cliente.nombre}</td>
          <td>${cliente.direccion}</td>
          <td>${cliente.telefono}</td>
          <td>${cliente.numero_doc}</td>
        `;
        tbody.appendChild(fila);
      });
  
    } catch (err) {
      console.error('❌ Error al obtener clientes:', err);
    }
  });