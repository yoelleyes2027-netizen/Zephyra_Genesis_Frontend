document.getElementById("proveedor-form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const proveedor = {
      nombre: document.getElementById("nombre").value,
      telefono: document.getElementById("telefono").value,
      email: document.getElementById("email").value,
      direccion: document.getElementById("direccion").value,
      documento: document.getElementById("documento").value,
      denominacion: document.getElementById("denominacion").value,
    };
  
    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(proveedor),
      });
  
      const data = await res.json();
      const mensajeEl = document.getElementById("mensaje");
  
      if (res.ok) {
        mensajeEl.textContent = "✅ Proveedor registrado correctamente.";
        mensajeEl.style.color = "green";
        document.getElementById("proveedor-form").reset();
      } else {
        mensajeEl.textContent = `❌ Error: ${data.mensaje || "No se pudo registrar el proveedor"}`;
        mensajeEl.style.color = "red";
      }
    } catch (error) {
      console.error("Error al registrar proveedor:", error);
      const mensajeEl = document.getElementById("mensaje");
      mensajeEl.textContent = "❌ Error inesperado al enviar el formulario.";
      mensajeEl.style.color = "red";
    }
  });