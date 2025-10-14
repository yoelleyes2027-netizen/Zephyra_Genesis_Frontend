document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/productos", {
    method: "GET",
    credentials: "include", // envía cookies si es necesario
  })
    .then(response => {
      if (!response.ok) throw new Error("Error al obtener productos");
      return response.json();
    })
    .then(data => {
      const tabla = document.getElementById("tabla-productos-body");
      // ORDENAR productos por descripción alfabéticamente
      data.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
      data.forEach(producto => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${producto.codigo}</td>
            <td>${producto.descripcion}</td>
            <td>$${producto.precio_venta}</td>
            <td>$${producto.precio_compra}</td>
            <td>${producto.stock}</td>
            <td>${producto.unidad_medida}</td>
          `;
        tabla.appendChild(fila);
      });
    })
    .catch(error => {
      console.error("❌ Error cargando productos:", error);
    });
});