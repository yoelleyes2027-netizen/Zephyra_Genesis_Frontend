// ==================== LISTA COMPLETA ====================
document.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch('/api/clientes', {
        method: 'GET',
        credentials: 'include', // incluye cookies
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error('Error desde backend:', result);
        return;
      }
  
      // Tu endpoint ya devolvía directamente un array
      const clientes = Array.isArray(result) ? result : (result.data || []);
  
      // Render
      const tbody = document.getElementById('tabla-clientes-body');
      tbody.innerHTML = '';
  
      // (Opcional) ordenar por denominación alfabéticamente
      clientes.sort((a, b) => (a.denomincacion || a.denominacion || '').localeCompare(b.denomincacion || b.denominacion || ''));
  
      clientes.forEach(cliente => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${cliente.denominacion ?? ''}</td>
          <td>${cliente.numero_doc ?? ''}</td>
          <td>${cliente.email ?? ''}</td>
          <td>${cliente.direccion ?? ''}</td>
          <td>${cliente.telefono ?? ''}</td>
          <td>${cliente.nombre ?? ''}</td>
        `;
        tbody.appendChild(fila);
      });
    } catch (err) {
      console.error('❌ Error al obtener clientes:', err);
    }
  });
  
  
  // ==================== BUSCADOR (MISMO FLUJO QUE TENÍAS) ====================
  function buscarCliente() {
    const valor = document.getElementById("documento-input").value.trim();
    const mensajeError = document.getElementById("mensaje-error");
    const tabla = document.getElementById("tabla-cliente");
    const tbody = document.getElementById("tabla-cliente-body");
    const buscarPorDenominacion = document.getElementById("buscar-denominacion").checked;
  
    mensajeError.style.display = "none";
    tabla.style.display = "none";
    tbody.innerHTML = "";
  
    if (!valor) {
      mensajeError.textContent = "⚠️ Ingresá un valor válido.";
      mensajeError.style.display = "block";
      return;
    }
  
    // Endpoint según el checkbox (igual a tu código original)
    const endpoint = buscarPorDenominacion
      ? `/api/clientes/buscar/denominacion/${encodeURIComponent(valor)}`
      : `/api/clientes/buscar/${encodeURIComponent(valor)}`;
  
    fetch(endpoint, {
      method: "GET",
      credentials: "include", // cookies habilitadas
    })
      .then(response => {
        if (!response.ok) throw new Error("Cliente no encontrado");
        return response.json();
      })
      .then(cliente => {
        // En tu versión original usabas el objeto directo
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${cliente.nombre ?? ''}</td>
          <td>${cliente.denominacion ?? ''}</td>
          <td>${cliente.numero_doc ?? ''}</td>
          <td>${cliente.telefono ?? '--'}</td>
          <td>${cliente.email ?? '--'}</td>
          <td>${cliente.direccion ?? '--'}</td>
        `;
        tbody.appendChild(fila);
        tabla.style.display = "table";
      })
      .catch(error => {
        mensajeError.textContent = "❌ No se encontró el cliente con ese valor.";
        mensajeError.style.display = "block";
      });
  }
  
  // 👉 dejamos buscarCliente() en el scope global porque el HTML lo invoca con onclick
  window.buscarCliente = buscarCliente;