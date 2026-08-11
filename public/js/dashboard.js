// Verificar autenticación
document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Verificando autenticación...");

  fetch("/api/auth/verificar-token", {
    method: "GET",
    credentials: "include", // Importante para enviar cookies
  })
    .then(async response => {
      console.log("🔄 Respuesta del backend:", response.status);

      if (!response.ok) {
        console.warn("❌ Token inválido o expirado. Redirigiendo...");
        window.location.href = "../html/login.html";
      } else {
        const payload = await response.json();
        const rol = (payload.usuario?.rol || "").toLowerCase();

        if (rol === "admin_sistema") {
          window.location.href = "../html/adminSistema.html";
          return;
        }

        if (rol === "cajero") {
          window.location.href = "../html/cajeroUsuario.html";
          return;
        }

        if (rol === "recepcion") {
          window.location.href = "../html/recepcion.html";
          return;
        }

        console.log("✅ Token válido. Acceso permitido al dashboard.");
      }
    })
    .catch(error => {
      console.error("🚨 Error al verificar token:", error);
      window.location.href = "../html/login.html";
    });
});

// Cerrar sesión
document.getElementById("logout-btn").addEventListener("click", () => {
  console.log("🔒 Cerrando sesión...");

  fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  })
    .then(() => {
      console.log("🔁 Sesión cerrada. Redirigiendo al login...");
      window.location.href = '../html/login.html';
    })
    .catch(error => {
      console.error("❌ Error al cerrar sesión:", error);
    });
});