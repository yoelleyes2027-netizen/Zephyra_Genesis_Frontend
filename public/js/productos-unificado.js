// ====== Helpers DOM ======
const inputBusqueda = document.getElementById('codigo-input');
const chkDescripcion = document.getElementById('buscar_descripcion');
const btnBuscar = document.getElementById('btn-buscar');

const msgError = document.getElementById('mensaje-error');

const tablaResultado = document.getElementById('tabla-resultado');
const tbodyResultado = document.getElementById('tbody-resultado');

const tbodyProductos = document.getElementById('tbody-productos');

// ====== Carga del listado completo (equivale a productos.js) ======
document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/productos', {
    method: 'GET',
    credentials: 'include', // mantiene cookies/JWT si aplica
  })
    .then((response) => {
      if (!response.ok) throw new Error('Error al obtener productos');
      return response.json();
    })
    .then((data) => {
      // Ordenamos por descripción (igual que hacías)
      data.sort((a, b) => a.descripcion.localeCompare(b.descripcion));

      // Render
      data.forEach((producto) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${producto.codigoDeBarras}</td>
          <td>${producto.descripcion}</td>
          <td>$${producto.precioVenta}</td>
          <td>$${producto.precioCompra}</td>
          <td>${producto.stock}</td>
          <td>${producto.unidadDeMedida}</td>
        `;
        tbodyProductos.appendChild(fila);
      });
    })
    .catch((error) => {
      console.error('❌ Error cargando productos:', error);
    });
});

// ====== Búsqueda puntual (equivale a buscar-producto.js) ======
function limpiarResultado() {
  msgError.style.display = 'none';
  msgError.textContent = '';

  tablaResultado.style.display = 'none';
  tbodyResultado.innerHTML = '';
}

function renderFilaResultado(p) {
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td>${p.codigoDeBarras ?? ''}</td>
    <td>${p.descripcion ?? ''}</td>
    <td>$${p.precioVenta ?? ''}</td>
    <td>$${p.precioCompra ?? ''}</td>
    <td>${p.stock ?? ''}</td>
    <td>${p.unidadDeMedida ?? ''}</td>
    <td>${p.etiqueta ?? ''}</td>
    <td>${p.proveedorNombre ?? ''}</td>
  `;
  tbodyResultado.appendChild(fila);
  tablaResultado.style.display = 'table';
}

async function buscarProducto() {
  limpiarResultado();

  const valor = (inputBusqueda.value || '').trim();
  const porDescripcion = chkDescripcion.checked;

  if (!valor) {
    msgError.textContent = '⚠️ Ingresá un valor válido.';
    msgError.style.display = 'block';
    return;
  }

  // Mismos endpoints que ya usas:
  // - /api/productos/:codigo
  // - /api/productos/descripcion/:descripcion
  const endpoint = porDescripcion
    ? `/api/productos/descripcion/${encodeURIComponent(valor)}`
    : `/api/productos/${encodeURIComponent(valor)}`;

  try {
    const resp = await fetch(endpoint, { method: 'GET', credentials: 'include' });
    if (!resp.ok) throw new Error('Producto no encontrado');

    const payload = await resp.json();
    // si viene con { ok, data }, usamos data; si en algún lugar viejo te retorna un objeto, lo normalizamos a array
    const resultados = Array.isArray(payload) ? payload
      : Array.isArray(payload.data) ? payload.data
        : [payload];

    // pintar todas las filas
    resultados.forEach(renderFilaResultado);
  } catch (err) {
    msgError.textContent = '❌ No se encontró el producto.';
    msgError.style.display = 'block';
  }
}

// Click y Enter para buscar
btnBuscar.addEventListener('click', buscarProducto);
inputBusqueda.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    buscarProducto();
  }
});