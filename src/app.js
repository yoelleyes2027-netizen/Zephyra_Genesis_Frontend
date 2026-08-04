const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const axios = require('axios');

// Cargar variables de entorno desde .env
dotenv.config();

// Crear app
const app = express();
const backendApiBaseUrl = (process.env.BACKEND_API_URL || 'http://localhost:8080').replace(/\/$/, '');

app.use(cookieParser());

// Middleware para recibir JSON
app.use(express.json());

const adminSistemaHtmlPath = path.join(__dirname, '../public/html/adminSistema.html');

app.get('/html/adminSistema.html', async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.redirect('/html/login.html');
    }

    const response = await axios.get(`${backendApiBaseUrl}/api/auth/verificar-token`, {
      headers: {
        Cookie: `token=${token}`,
      },
      validateStatus: () => true,
    });

    const rol = response.data?.usuario?.rol;
    if (response.status === 200 && rol === 'admin_sistema') {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      return res.sendFile(adminSistemaHtmlPath);
    }

    return res.redirect('/html/login.html');
  } catch (error) {
    return next(error);
  }
});

// Hacer pública la carpeta /public
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.redirect('/html/login.html');
});

const proxyApiRequest = async (req, res, next) => {
  try {
    const upstreamPath = req.originalUrl.replace(/^\/api/, '') || '/';
    const targetUrl = `${backendApiBaseUrl}${upstreamPath}`;
    const response = await axios.request({
      method: req.method,
      url: targetUrl,
      data: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
      headers: {
        ...req.headers,
        host: new URL(backendApiBaseUrl).host,
      },
      responseType: 'arraybuffer',
      validateStatus: () => true,
    });

    for (const [headerName, headerValue] of Object.entries(response.headers)) {
      const normalizedHeader = headerName.toLowerCase();
      if (normalizedHeader === 'content-length' || normalizedHeader === 'transfer-encoding' || normalizedHeader === 'connection') {
        continue;
      }
      res.setHeader(headerName, headerValue);
    }

    res.status(response.status).send(Buffer.from(response.data));
  } catch (error) {
    console.error('Error proxying API request:', error.message);
    res.status(503).json({
      ok: false,
      msg: 'El backend no está disponible en este momento. Intentá nuevamente en unos segundos.',
    });
  }
};

app.use('/api', proxyApiRequest);


// Puerto
const PORT = process.env.PORT || 3001;
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor CRM corriendo en http://localhost:${PORT}`);
});
