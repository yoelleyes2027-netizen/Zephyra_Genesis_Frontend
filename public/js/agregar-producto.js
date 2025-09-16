document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-agregar-producto");
  const mensaje = document.getElementById("mensaje");
  const proveedorSelect = form.proveedor_id;
  const etiquetaSelect = form.etiqueta_id;
  
  async function cargarProveedores() {
    try {
      const res = await fetch("/api/proveedores", {
        method: "GET",
        credentials: "include"
      });
      const result = await res.json();
      if (result.ok && Array.isArray(result.data)) {
        result.data
        .sort((a, b) => a.nombre.localeCompare(b.nombre)) // Ordenar por nombre A-Z
        .forEach(proveedor => {
          const option = document.createElement("option");
          option.value = proveedor.id;
          option.textContent = proveedor.nombre;
          proveedorSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error al cargar proveedores", error);
    }
  }
  
  async function cargarEtiquetas() {
    try {
      const res = await fetch("/api/etiquetas", {
        method: "GET",
        credentials: "include"
      });
      const etiquetas = await res.json();
      if (Array.isArray(etiquetas)) {
        etiquetas
          .sort((a, b) => a.nombre.localeCompare(b.nombre)) // orden alfabético
          .forEach(etiqueta => {
            const option = document.createElement("option");
            option.value = etiqueta.id;
            option.textContent = etiqueta.nombre;
            etiquetaSelect.appendChild(option);
          });
      }
    } catch (error) {
      console.error("Error al cargar etiquetas", error);
    }
  }
  
  // Ejecutar al cargar
  cargarProveedores();
  cargarEtiquetas();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      codigo: form.codigo.value,
      descripcion: form.descripcion.value,
      precio_venta: parseFloat(form.precio_venta.value),
      precio_compra: parseFloat(form.precio_compra.value),
      unidad_medida: form.unidad_medida.value,
      etiqueta_id: parseInt(form.etiqueta_id.value),
      proveedor_id: parseInt(form.proveedor_id.value)
    };

    try {
      const response = await fetch("/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // ← importante: estamos usando cookies
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.mensaje || "Error al agregar producto");

      mensaje.style.color = "green";
      mensaje.textContent = result.mensaje || "Producto agregado correctamente";

      form.reset();
    } catch (error) {
      mensaje.style.color = "red";
      mensaje.textContent = error.message || "Ocurrió un error inesperado";
    }
  });
});