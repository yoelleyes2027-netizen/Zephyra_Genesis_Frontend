function buscarProveedor() {
    const documento = document.getElementById("documento-input").value.trim();
    const mensajeError = document.getElementById("mensaje-error");
    const tabla = document.getElementById("tabla-proveedor");
    const tbody = document.getElementById("tabla-proveedor-body");
  
    mensajeError.style.display = "none";
    tabla.style.display = "none";
    tbody.innerHTML = "";
  
    if (!documento) {
      mensajeError.textContent = "⚠️ Ingresá un documento válido.";
      mensajeError.style.display = "block";
      return;
    }
  
    fetch(`/api/proveedores/buscar/${documento}`, {
      method: "GET",
      credentials: "include",
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
        mensajeError.textContent = "❌ No se encontró el proveedor con ese documento.";
        mensajeError.style.display = "block";
      });
  }