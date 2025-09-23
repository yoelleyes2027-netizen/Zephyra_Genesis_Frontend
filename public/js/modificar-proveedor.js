// FORMULARIO DE BÚSQUEDA
document.getElementById('formBuscar').addEventListener('submit', async function (e) {
    e.preventDefault();

    const numeroDoc = document.getElementById('documentoBuscar').value;
    const mensajeEl = document.getElementById('mensaje');

    try {
        const response = await fetch(`/api/proveedores/buscar/${numeroDoc}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Proveedor no encontrado');
        }

        const respuesta = await response.json();  // ✅ importante
        const proveedor = respuesta.data;         // ✅ accedemos a los datos reales

        // Rellenar el formulario
        document.getElementById('nombre').value = proveedor.nombre || '';
        document.getElementById('telefono').value = proveedor.telefono || '';
        document.getElementById('email').value = proveedor.email || '';
        document.getElementById('direccion').value = proveedor.direccion || '';
        document.getElementById('denominacion').value = proveedor.denominacion || '';

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

    const numeroDoc = document.getElementById('documentoBuscar').value;

    if (!numeroDoc || typeof numeroDoc !== 'string' || !numeroDoc.trim()) {
        mensajeEl.textContent = 'Número de documento inválido.';
        mensajeEl.style.color = 'red';
        return;
    }

    const datos = {
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value,
        direccion: document.getElementById('direccion').value,
        denominacion: document.getElementById('denominacion').value,
    };

    // Limpiar campos vacíos o nulos
    Object.keys(datos).forEach(key => {
        if (!datos[key] || datos[key] === null) {
            delete datos[key];
        }
    });

    const mensajeEl = document.getElementById('mensaje');

    try {
        const response = await fetch(`/api/proveedores/${numeroDoc}`, {
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