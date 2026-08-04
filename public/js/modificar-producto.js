async function cargarProveedores() {
  try {
    const res = await fetch('/api/proveedores', {
      method: 'GET',
      credentials: 'include'
    });

    const result = await res.json();
    const proveedorSelect = document.getElementById('proveedor_id');

    if (res.ok && Array.isArray(result.data)) {
      result.data
        .sort((a, b) => a.name.localeCompare(b.name)) // Orden A-Z
        .forEach(proveedor => {
          const option = document.createElement('option');
          option.value = proveedor.id;
          option.textContent = proveedor.name;
          proveedorSelect.appendChild(option);
        });
    }
  } catch (error) {
    console.error('Error al cargar proveedores', error);
  }
}

async function cargarEtiquetas() {
  try {
    const res = await fetch('/api/etiquetas', {
      method: 'GET',
      credentials: 'include'
    });

    const etiquetas = await res.json();
    const etiquetaSelect = document.getElementById('etiqueta_id');

    if (Array.isArray(etiquetas)) {
      etiquetas
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .forEach(etiqueta => {
          const option = document.createElement('option');
          option.value = etiqueta.nombre;
          option.textContent = etiqueta.nombre;
          etiquetaSelect.appendChild(option);
        });
    }
  } catch (error) {
    console.error('Error al cargar etiquetas', error);
  }
}

// Ejecutar al cargar
window.addEventListener('DOMContentLoaded', () => {
  cargarProveedores();
  cargarEtiquetas();
});

// FORMULARIO DE BÚSQUEDA
document.getElementById('formBuscar').addEventListener('submit', async function (e) {
  e.preventDefault();

  const codigo = document.getElementById('codigoBuscar').value;
  const mensajeEl = document.getElementById('mensaje');

  try {
    const response = await fetch(`/api/productos/${codigo}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Producto no encontrado');
    }

    const producto = await response.json();

    console.log(producto)

    // Rellenar el formulario con los datos
    document.getElementById('codigo').value = producto.codigoDeBarras;
    document.getElementById('descripcion').value = producto.descripcion;
    document.getElementById('precio_venta').value = producto.precioVenta;
    document.getElementById('precio_compra').value = producto.precioCompra;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('unidad_medida').value = producto.unidadDeMedida;

    // Seleccionar opción de etiqueta y proveedor por NOMBRE (no por id)
    const etiquetaSelect = document.getElementById('etiqueta_id');
    const proveedorSelect = document.getElementById('proveedor_id');

    // Seleccionar etiqueta
    etiquetaSelect.value = producto.etiqueta || '';
    if (!etiquetaSelect.value && producto.etiqueta) {
      const nuevaEtiqueta = document.createElement('option');
      nuevaEtiqueta.value = producto.etiqueta;
      nuevaEtiqueta.textContent = producto.etiqueta;
      nuevaEtiqueta.selected = true;
      etiquetaSelect.insertBefore(nuevaEtiqueta, etiquetaSelect.firstChild);
    }

    // Seleccionar proveedor
    proveedorSelect.value = producto.proveedorId || '';
    if (!proveedorSelect.value && producto.proveedorNombre) {
      const nuevoProveedor = document.createElement('option');
      nuevoProveedor.value = String(producto.proveedorId || '');
      nuevoProveedor.textContent = producto.proveedorNombre;
      nuevoProveedor.selected = true;
      proveedorSelect.insertBefore(nuevoProveedor, proveedorSelect.firstChild);
    }
    document.getElementById('cod_barra').value = producto.codigoDeBarras || '';

    // Mostrar el formulario de modificación
    document.getElementById('selection-form').style.display = 'block';
    mensajeEl.textContent = '';
  } catch (error) {
    console.error('Error:', error);
    mensajeEl.textContent = 'Producto no encontrado.';
    mensajeEl.style.color = 'red';
  }
});

// FORMULARIO DE MODIFICACIÓN
document.getElementById('formModificar').addEventListener('submit', async function (e) {
  e.preventDefault();

  const codigo = document.getElementById('codigo').value;

  const datos = {
    codigoDeBarras: Number(codigo),
    descripcion: document.getElementById('descripcion').value,
    precioVenta: parseFloat(document.getElementById('precio_venta').value),
    precioCompra: parseFloat(document.getElementById('precio_compra').value),
    stock: parseInt(document.getElementById('stock').value),
    unidadDeMedida: document.getElementById('unidad_medida').value,
    etiqueta: document.getElementById('etiqueta_id').value,
    proveedorId: parseInt(document.getElementById('proveedor_id').value)
  };

  // Eliminar campos vacíos o inválidos
  Object.keys(datos).forEach(key => {
    if (datos[key] === '' || datos[key] === null || Number.isNaN(datos[key])) {
      delete datos[key];
    }
  });

  // helpers para manejar !important
  const mostrar = (el) => el.style.setProperty('display', 'block', 'important');

  const correcto = document.getElementById('correcto');
  const mensajeEl = document.getElementById('mensaje.ok');

  try {
    const response = await fetch(`/api/productos/${codigo}`, {
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
      mostrar(correcto);

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