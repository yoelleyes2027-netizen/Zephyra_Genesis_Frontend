document.getElementById("cliente-form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const cliente = {
      name: document.getElementById("nombre").value,
      telefono: Number(document.getElementById("telefono").value || 0),
      email: document.getElementById("email").value,
    };
  
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(cliente),
      });
  
      const data = await res.json();
      const mensajeEl = document.getElementById("mensaje");
  
      if (res.ok) {
        mensajeEl.textContent = "✅ Cliente creado correctamente.";
        mensajeEl.style.color = "green";
        document.getElementById("cliente-form").reset();
      } else {
        mensajeEl.textContent = `❌ Error: ${data.mensaje || "No se pudo crear el cliente"}`;
        mensajeEl.style.color = "red";
      }
    } catch (error) {
      console.error("Error al crear cliente:", error);
      document.getElementById("mensaje").textContent = "❌ Error inesperado al enviar el formulario.";
      document.getElementById("mensaje").style.color = "red";
    }
  });