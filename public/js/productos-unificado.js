// ====== Helpers DOM ======
const inputBusqueda = document.getElementById('codigo-input');
const chkDescripcion = document.getElementById('buscar_descripcion');
const btnBuscar = document.getElementById('btn-buscar');

const msgError = document.getElementById('mensaje-error');

const tablaResultado = document.getElementById('tabla-resultado');
const tbodyResultado = document.getElementById('tbody-resultado');

const tbodyProductos = document.getElementById('tbody-productos');

function escapeHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
          <td>${escapeHtml(producto.codigoDeBarras)}</td>
          <td>${escapeHtml(producto.descripcion)}</td>
          <td>$${escapeHtml(producto.precioVenta)}</td>
          <td>$${escapeHtml(producto.precioCompra)}</td>
          <td>${escapeHtml(producto.stock)}</td>
          <td>${escapeHtml(producto.unidadDeMedida)}</td>
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
    <td>${escapeHtml(p.codigoDeBarras ?? '')}</td>
    <td>${escapeHtml(p.descripcion ?? '')}</td>
    <td>$${escapeHtml(p.precioVenta ?? '')}</td>
    <td>$${escapeHtml(p.precioCompra ?? '')}</td>
    <td>${escapeHtml(p.stock ?? '')}</td>
    <td>${escapeHtml(p.unidadDeMedida ?? '')}</td>
    <td>${escapeHtml(p.etiqueta ?? '')}</td>
    <td>${escapeHtml(p.proveedorNombre ?? '')}</td>
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