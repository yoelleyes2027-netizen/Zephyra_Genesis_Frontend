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
        .sort((a, b) => a.nombre.localeCompare(b.nombre)) // Orden A-Z
        .forEach(proveedor => {
          const option = document.createElement('option');
          option.value = proveedor.id;
          option.textContent = proveedor.nombre;
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
          option.value = etiqueta.id;
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

    // Rellenar el formulario con los datos
    document.getElementById('codigo').value = producto.codigo;
    document.getElementById('descripcion').value = producto.descripcion;
    document.getElementById('precio_venta').value = producto.precio_venta;
    document.getElementById('precio_compra').value = producto.precio_compra;
    document.getElementById('stock').value = producto.stock;
    document.getElementById('unidad_medida').value = producto.unidad_medida;
    
    const etiquetaSelect = document.getElementById('etiqueta_id');
    const proveedorSelect = document.getElementById('proveedor_id');

    Array.from(etiquetaSelect.options).forEach(option => {
      if (parseInt(option.value) === producto.etiqueta_id) {
        option.selected = true;
      }
    });

    Array.from(proveedorSelect.options).forEach(option => {
      if (parseInt(option.value) === producto.proveedor_id) {
        option.selected = true;
      }
    });

    document.getElementById('cod_barra').value = producto.cod_barra || '';

    // Mostrar el formulario de modificación
    document.getElementById('formModificar').style.display = 'block';
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
    descripcion: document.getElementById('descripcion').value,
    precio_venta: parseFloat(document.getElementById('precio_venta').value),
    precio_compra: parseFloat(document.getElementById('precio_compra').value),
    stock: parseInt(document.getElementById('stock').value),
    unidad_medida: document.getElementById('unidad_medida').value,
    etiqueta_id: parseInt(document.getElementById('etiqueta_id').value),
    proveedor_id: parseInt(document.getElementById('proveedor_id').value),
    cod_barra: document.getElementById('cod_barra').value || null
  };

  // Eliminar campos vacíos o inválidos
  Object.keys(datos).forEach(key => {
    if (datos[key] === '' || datos[key] === null || Number.isNaN(datos[key])) {
      delete datos[key];
    }
  });

  const mensajeEl = document.getElementById('mensaje');

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