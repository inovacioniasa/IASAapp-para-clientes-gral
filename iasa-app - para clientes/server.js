import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getFirestore } from 'firebase-admin/firestore';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

// Cargar credenciales de Firebase de forma segura.
let serviceAccount = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error('FIREBASE_SERVICE_ACCOUNT no es JSON válido');
  }
} else {
  // Intentar cargar fichero local (solo en desarrollo)
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'serviceAccountKey.json'), 'utf8');
    serviceAccount = JSON.parse(raw);
  } catch (e) {
    // no hacer crash aquí; validamos abajo
  }
}

if (!serviceAccount) {
  console.error('No se encontraron credenciales de Firebase. Define FIREBASE_SERVICE_ACCOUNT en .env.');
  // No salimos automáticamente para permitir ejecutar linter/tests; en producción deberías abortar.
}

// Inicializa la app de Firebase (si tenemos credenciales)
try {
  if (serviceAccount) {
    initializeApp({ credential: cert(serviceAccount) });
  }
} catch (e) {
  console.error('Error inicializando Firebase:', e && e.message);
}

const db = getFirestore();

const app = express();

// Seguridad y logging
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Rate limiting básico para APIs
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }); // 200 requests por IP por 15 minutos
app.use('/api/', apiLimiter);

// Middleware para parsear JSON en las peticiones
app.use(express.json({ limit: '100kb' }));
// --- NUEVO ENDPOINT PARA COTIZACIONES DE GRANOS ---
app.get('/api/quotes', async (req, res) => {
  const symbols = ['ZS=F', 'ZC=F', 'ZW=F']; // Soja, Maíz, Trigo
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`;

  try {
    const yahooResponse = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' } // Yahoo a veces requiere un User-Agent
    });

    if (!yahooResponse.ok) {
      throw new Error(`Error de Yahoo Finance: ${yahooResponse.statusText}`);
    }

    const data = await yahooResponse.json();
    const quotes = {};

    data.quoteResponse.result.forEach(q => {
      quotes[q.symbol] = {
        price: q.regularMarketPrice,
        change: q.regularMarketChange,
        changePct: q.regularMarketChangePercent / 100, // La API lo da en %, lo pasamos a decimal
        ts: q.regularMarketTime
      };
    });

    // El frontend espera un formato específico, lo adaptamos aquí
    const formattedQuotes = {
      'SOY': quotes['ZS=F'],
      'CORN': quotes['ZC=F'],
      'WHEAT': quotes['ZW=F']
    };

    res.json(formattedQuotes);
  } catch (error) {
    console.error('Error en /api/quotes:', error.message);
    res.status(500).json({ error: 'No se pudieron cargar las cotizaciones' });
  }
});

// Endpoint para recibir los datos del formulario de contacto y guardarlos en Firestore
app.post('/api/contact', async (req, res) => {
  try {
    const contactData = req.body;

    // Validación básica en el servidor
    if (!contactData.name || !contactData.email || !contactData.message || !contactData.location) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    // Guardar en una colección llamada 'consultas' en Firestore
    const docRef = await db.collection('consultas').add(contactData);

    console.log('Consulta guardada con ID: ', docRef.id);
    res.status(201).json({ message: 'Mensaje recibido con éxito', id: docRef.id });

  } catch (error) {
    console.error('Error al guardar en Firestore:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Endpoint para recibir los datos del formulario de agendar visita
app.post('/api/visit', async (req, res) => {
  try {
    const visitData = req.body;

    // Validación básica en el servidor
    if (!visitData.name || !visitData.farm || !visitData.contact || !visitData.date || !visitData.message) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    // Guardar en una colección llamada 'visitas' en Firestore
    const docRef = await db.collection('visitas').add(visitData);

    console.log('Solicitud de visita guardada con ID: ', docRef.id);
    res.status(201).json({ message: 'Solicitud recibida con éxito', id: docRef.id });

  } catch (error) {
    console.error('Error al guardar solicitud de visita en Firestore:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Servir archivos estáticos (front-end) desde la raíz del proyecto
// Añadimos `setHeaders` para controlar el cache desde el servidor:
// - HTML y el service worker se sirven con no-cache para que el navegador
//   verifique siempre si hay una versión nueva.
// - Assets estáticos versionados (css/js/imagenes) se sirven con cache larga e immutable.
app.use(express.static(path.join(process.cwd()), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const base = path.basename(filePath).toLowerCase();

    // Forzar no-cache para HTML y para el service worker
    if (ext === '.html' || base === 'sw.js') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return;
    }

    // Para assets estáticos (css/js/imagenes/font) servir con caché larga si están versionados
    const longCacheExts = ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.woff2', '.woff', '.ttf', '.ico'];
    if (longCacheExts.includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Middleware para manejar URLs limpias (sin extensión .html)
const cleanUrlPages = [
  'homenoticias', 'comunidad', 'mercado', 'activities', 'contacto',
  'pedidos', 'perfil', 'qr', 'registro', 'soporte', 'visitas',
  'onboarding', 'privacy-policy'
];

cleanUrlPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(process.cwd(), page, 'index.html'));
  });
});

// Fallback: servir index.html para la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// Error handler básico
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


