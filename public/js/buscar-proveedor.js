function buscarProveedor() {
  const input = document.getElementById("documento-input").value.trim();
  const buscarPorDenominacion = document.getElementById("buscar-denominacion").checked;
  const mensajeError = document.getElementById("mensaje-error");
  const tabla = document.getElementById("tabla-proveedor");
  const tbody = document.getElementById("tabla-proveedor-body");

  mensajeError.style.display = "none";
  tabla.style.display = "none";
  tbody.innerHTML = "";

  if (!input) {
    mensajeError.textContent = "⚠️ Ingresá un valor válido.";
    mensajeError.style.display = "block";
    return;
  }

  const endpoint = buscarPorDenominacion
    ? `/api/proveedores/buscar/denominacion/${encodeURIComponent(input)}`
    : `/api/proveedores/buscar/${input}`;

  fetch(endpoint, {
    method: "GET",
    credentials: "include", // cookies habilitadas
  })
    .then(response => {
      if (!response.ok) throw new Error("Proveedor no encontrado");
      return response.json();
    })
    .then(respuesta => {
      const proveedor = respuesta.data;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${proveedor.nombre}</td>
        <td>${proveedor.denominacion}</td>
        <td>${proveedor.documento}</td>
        <td>${proveedor.telefono || "--"}</td>
        <td>${proveedor.email || "--"}</td>
        <td>${proveedor.direccion || "--"}</td>
      `;

      tbody.appendChild(fila);
      tabla.style.display = "table";
    })
    .catch(error => {
      mensajeError.textContent = "❌ No se encontró el proveedor con ese dato.";
      mensajeError.style.display = "block";
    });
}