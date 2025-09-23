function buscarProducto() {
  const valorInput = document.getElementById("codigo-input").value.trim();
  const buscarPorDescripcion = document.getElementById("buscar-descripcion").checked;

  const mensajeError = document.getElementById("mensaje-error");
  const tabla = document.getElementById("tabla-producto");
  const tbody = document.getElementById("tabla-producto-body");

  mensajeError.style.display = "none";
  tabla.style.display = "none";
  tbody.innerHTML = "";

  if (!valorInput) {
    mensajeError.textContent = "⚠️ Ingresá un valor válido.";
    mensajeError.style.display = "block";
    return;
  }

  // 👉 Define el endpoint según el tipo de búsqueda
  const endpoint = buscarPorDescripcion
    ? `/api/productos/descripcion/${encodeURIComponent(valorInput)}`
    : `/api/productos/${encodeURIComponent(valorInput)}`;

  fetch(endpoint, {
    method: "GET",
    credentials: "include", // cookies habilitadas
  })
    .then(response => {
      if (!response.ok) throw new Error("Producto no encontrado");
      return response.json();
    })
    .then(producto => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${producto.codigo}</td>
        <td>${producto.descripcion}</td>
        <td>${producto.precio_venta}</td>
        <td>${producto.precio_compra}</td>
        <td>${producto.stock}</td>
        <td>${producto.unidad_medida}</td>
        <td>${producto.etiqueta}</td>
        <td>${producto.proveedor}</td>
      `;
      tbody.appendChild(fila);
      tabla.style.display = "table";
    })
    .catch(error => {
      mensajeError.textContent = "❌ No se encontró el producto.";
      mensajeError.style.display = "block";
    });
}