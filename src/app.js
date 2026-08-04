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

// Hacer pública la carpeta /public
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para recibir JSON
app.use(express.json());

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
    next(error);
  }
};

app.use('/api', proxyApiRequest);


// Puerto
const PORT = process.env.PORT || 3001;
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor CRM corriendo en http://localhost:${PORT}`);
});
