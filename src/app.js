const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const rutas = require('./routes/index');
const authRoutes = require('./routes/auth.routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Cargar variables de entorno desde .env
dotenv.config();

// Crear app
const app = express();

app.use(cookieParser());

// Hacer pública la carpeta /public
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para recibir JSON
app.use(express.json());

// Rutas de la app
app.use('/api', rutas);

// Puerto
const PORT = process.env.PORT || 3001;
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor CRM corriendo en http://localhost:${PORT}`);
});

app.use('/api/auth', authRoutes);


app.use(cors({
  origin: 'http://localhost:5173', // Cambiá esto al dominio real del frontend cuando lo tengas
  credentials: true                // Esto permite enviar cookies
}));