let proveedorDocumentoOriginal = null;

// FORMULARIO DE BÚSQUEDA
document.getElementById('formBuscar').addEventListener('submit', async function (e) {
    e.preventDefault();

    const numeroDoc = document.getElementById('documentoBuscar').value.trim();
    const mensajeEl = document.getElementById('mensaje');

    try {
        const response = await fetch(`/api/proveedores/buscar/${encodeURIComponent(numeroDoc)}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Proveedor no encontrado');
        }

        const respuesta = await response.json();  // ✅ importante
        const proveedor = respuesta.data;         // ✅ accedemos a los datos reales
    proveedorDocumentoOriginal = proveedor.numeroDocumento || numeroDoc;

        // Rellenar el formulario
    document.getElementById('nombre').value = proveedor.name || '';
        document.getElementById('telefono').value = proveedor.telefono || '';
        document.getElementById('email').value = proveedor.email || '';
        document.getElementById('direccion').value = proveedor.direccion || '';
    document.getElementById('denominacion').value = proveedor.razonSocial || '';
    document.getElementById('documento').value = proveedor.numeroDocumento || '';

        document.getElementById('formModificar').style.display = 'block';
        mensajeEl.textContent = '';
    } catch (error) {
        console.error('Error:', error);
        mensajeEl.textContent = 'Proveedor no encontrado.';
        mensajeEl.style.color = 'red';
    }
});


// FORMULARIO DE MODIFICACIÓN
document.getElementById('formModificar').addEventListener('submit', async function (e) {
    e.preventDefault();

    const mensajeEl = document.getElementById('mensaje');
    const numeroDoc = proveedorDocumentoOriginal || document.getElementById('documentoBuscar').value.trim();

    if (!numeroDoc) {
        mensajeEl.textContent = 'Número de documento inválido.';
        mensajeEl.style.color = 'red';
        return;
    }

    const datos = {
        name: document.getElementById('nombre').value,
        telefono: Number(document.getElementById('telefono').value || 0),
        email: document.getElementById('email').value,
        direccion: document.getElementById('direccion').value,
        numeroDocumento: document.getElementById('documento').value,
        razonSocial: document.getElementById('denominacion').value,
        tipoDocumento: document.getElementById('tipo_documento')?.value || 'CI',
    };

    // Limpiar campos vacíos o nulos
    Object.keys(datos).forEach(key => {
        if (!datos[key] || datos[key] === null) {
            delete datos[key];
        }
    });

    try {
        const response = await fetch(`/api/proveedores/${encodeURIComponent(numeroDoc)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();

        if (response.ok) {
            mensajeEl.textContent = resultado.mensaje;
            mensajeEl.style.color = 'green';
            proveedorDocumentoOriginal = datos.numeroDocumento || numeroDoc;
        } else {
            mensajeEl.textContent = resultado.mensaje || 'Error al actualizar';
            mensajeEl.style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        mensajeEl.textContent = 'Error inesperado.';
        mensajeEl.style.color = 'red';
    }
});