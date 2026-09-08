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

// Confia unicamente en el proxy inmediato (Nginx) para obtener la IP real del cliente.
app.set('trust proxy', 1);
app.disable('x-powered-by');

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

app.use(cookieParser());

// Middleware para recibir JSON
app.use(express.json({ limit: '1mb' }));

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
      maxRedirects: 0,
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
app.use(express.static(path.join(__dirname, '../public'), {
  dotfiles: 'ignore',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
  },
}));

app.get('/', (req, res) => {
  res.redirect('/html/login.html');
});

// Solo se reenvian cabeceras necesarias: evita spoofing de X-Forwarded-* y desajustes de Content-Length.
const FORWARDABLE_HEADERS = ['cookie', 'content-type', 'accept', 'accept-language', 'user-agent'];
const RESPONSE_HEADERS_TO_SKIP = new Set([
  'content-length',
  'transfer-encoding',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'upgrade',
]);

const buildUpstreamHeaders = (req) => {
  const headers = {};
  for (const headerName of FORWARDABLE_HEADERS) {
    const value = req.headers[headerName];
    if (typeof value === 'string' && value.length > 0) {
      headers[headerName] = value;
    }
  }
  headers.host = new URL(backendApiBaseUrl).host;
  headers['x-forwarded-for'] = req.ip;
  headers['x-forwarded-proto'] = req.protocol;
  return headers;
};

const proxyApiRequest = async (req, res, next) => {
  try {
    const upstreamPath = req.originalUrl || '/';
    const targetUrl = `${backendApiBaseUrl}${upstreamPath}`;
    const response = await axios.request({
      method: req.method,
      url: targetUrl,
      data: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body,
      headers: buildUpstreamHeaders(req),
      responseType: 'arraybuffer',
      maxRedirects: 0,
      validateStatus: () => true,
    });

    for (const [headerName, headerValue] of Object.entries(response.headers)) {
      if (RESPONSE_HEADERS_TO_SKIP.has(headerName.toLowerCase())) {
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
