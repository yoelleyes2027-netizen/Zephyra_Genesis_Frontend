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

  // Construimos el endpoint según el checkbox
  const endpoint = buscarPorDenominacion
    ? `/api/clientes/buscar/denominacion/${valor}`
    : `/api/clientes/buscar/${valor}`;

  fetch(endpoint, {
    method: "GET",
    credentials: "include", // cookies habilitadas
  })
    .then(response => {
      if (!response.ok) throw new Error("Cliente no encontrado");
      return response.json();
    })
    .then(cliente => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${cliente.nombre}</td>
        <td>${cliente.denominacion}</td>
        <td>${cliente.numero_doc}</td>
        <td>${cliente.telefono || "--"}</td>
        <td>${cliente.email || "--"}</td>
        <td>${cliente.direccion || "--"}</td>
      `;
      tbody.appendChild(fila);
      tabla.style.display = "table";
    })
    .catch(error => {
      mensajeError.textContent = "❌ No se encontró el cliente con ese valor.";
      mensajeError.style.display = "block";
    });
}