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
    // ORDENAR por nombre alfabéticamente antes de renderizar
    proveedores.sort((a, b) => a.nombre.localeCompare(b.nombre));
    const tbody = document.getElementById('proveedoresBody');
    tbody.innerHTML = '';

    proveedores.forEach(proveedor => {
      const row = document.createElement('tr');

      row.innerHTML = `
          <td>${proveedor.nombre}</td>
          <td>${proveedor.documento}</td>
          <td>${proveedor.direccion}</td>
          <td>${proveedor.telefono}</td>
          <td>${proveedor.email}</td>
          <td>${proveedor.denominacion}</td>
        `;

      tbody.appendChild(row);
    });

  } catch (err) {
    console.error('Error al obtener proveedores:', err);
  }
});