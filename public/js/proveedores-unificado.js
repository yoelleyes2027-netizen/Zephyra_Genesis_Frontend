// ====== BÚSQUEDA puntual (respeta tu flujo/IDs originales) ======
async function buscarProveedor() {
    const input = document.getElementById("documento-input").value.trim();
    const buscarPorDenominacion = document.getElementById("buscar-denominacion").checked;
  
    const mensajeError = document.getElementById("mensaje-error");
    const tabla = document.getElementById("tabla-proveedor");
    const tbody = document.getElementById("tabla-proveedor-body");
  
    // Reset UI
    mensajeError.style.display = "none";
    tabla.style.display = "none";
    tbody.innerHTML = "";
  
    if (!input) {
      mensajeError.textContent = "⚠️ Ingresá un valor válido.";
      mensajeError.style.display = "block";
      return;
    }
  
    // Endpoint según checkbox (mismos endpoints que ya usabas)
    const endpoint = buscarPorDenominacion
      ? `/api/proveedores/buscar/denominacion/${encodeURIComponent(input)}`
      : `/api/proveedores/buscar/${encodeURIComponent(input)}`;
  
    try {
      const response = await fetch(endpoint, { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error("Proveedor no encontrado");
  
      // Tus controladores devolvían { data: {...} } o similar; conservamos esto
      const respuesta = await response.json();
      const proveedor = Array.isArray(respuesta.data) ? respuesta.data[0] : respuesta.data;
  
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${proveedor.name || ""}</td>
        <td>${proveedor.razonSocial || ""}</td>
        <td>${proveedor.numeroDocumento || ""}</td>
        <td>${proveedor.telefono || ""}</td>
        <td>${proveedor.email || ""}</td>
        <td>${proveedor.direccion || ""}</td>
      `;
      tbody.appendChild(fila);
      tabla.style.display = "table";
    } catch (error) {
      mensajeError.textContent = "❌ No se encontró el proveedor con ese dato.";
      mensajeError.style.display = "block";
    }
  }
  
  // ====== LISTADO completo (respeta tu flujo/IDs originales) ======
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch("/api/proveedores", {
        method: "GET",
        credentials: "include", // mantiene cookies/session si las necesitás
      });
  
      const result = await response.json();
      if (!result.ok) {
        console.error("Error desde backend:", result.msg);
        return;
      }
  
      const proveedores = result.data || [];
      // Orden alfabético por nombre (como ya hacías)
      proveedores.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  
      const tbody = document.getElementById("proveedoresBody");
      tbody.innerHTML = "";
  
      proveedores.forEach((proveedor) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${proveedor.name || ""}</td>
          <td>${proveedor.numeroDocumento || ""}</td>
          <td>${proveedor.direccion || ""}</td>
          <td>${proveedor.telefono || ""}</td>
          <td>${proveedor.email || ""}</td>
          <td>${proveedor.razonSocial || ""}</td>
        `;
        tbody.appendChild(row);
      });
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
    }
  });