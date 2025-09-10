document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-agregar-producto");
    const mensaje = document.getElementById("mensaje");
  
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