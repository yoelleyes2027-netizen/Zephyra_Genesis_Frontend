document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('/api/proveedores', {
        method: 'GET',
        credentials: 'include', // Para enviar cookies
      });
  
      const result = await response.json();
  
      if (!result.ok) {
        console.error('Error desde backend:', result.msg);
        return;
      }
  
      const proveedores = result.data;
      const tbody = document.getElementById('proveedoresBody');
      tbody.innerHTML = '';
  
      proveedores.forEach(proveedor => {
        const row = document.createElement('tr');
  
        row.innerHTML = `
          <td>${proveedor.id}</td>
          <td>${proveedor.nombre}</td>
          <td>${proveedor.direccion}</td>
          <td>${proveedor.telefono}</td>
        `;
  
        tbody.appendChild(row);
      });
  
    } catch (err) {
      console.error('Error al obtener proveedores:', err);
    }
  });