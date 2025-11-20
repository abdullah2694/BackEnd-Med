const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { logger, maskSensitive } = require('./lib/logger');

dotenv.config();

const app = express();

// CORS configuration: allowed origins can be provided via ALLOWED_ORIGINS env (comma-separated)
const allowedEnv = process.env.ALLOWED_ORIGINS || '';
const allowCredentials = (process.env.ALLOW_CREDENTIALS || 'false').toLowerCase() === 'true';
const allowedOrigins = allowedEnv.split(',').map((s) => s.trim()).filter(Boolean);

if (allowedOrigins.length === 0) {
  // No allowed origins configured — default permissive for development
  app.use(cors({ origin: true, credentials: allowCredentials }));
  logger.info('CORS: permissive (no ALLOWED_ORIGINS set)');
} else {
  app.use(
    cors({
      origin: (origin, cb) => {
        // allow requests like curl/postman with no origin
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('CORS blocked by policy'), false);
      },
      credentials: allowCredentials,
    })
  );
  logger.info(`CORS: restricted to ${allowedOrigins.join(', ')}`);
}

app.use(express.json({ limit: '10mb' }));

// HTTP request logging via morgan -> winston
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Request debug middleware: logs headers (except token) and masked body
app.use((req, res, next) => {
  try {
    const safeHeaders = { ...req.headers };
    if (safeHeaders['x-auth-token']) safeHeaders['x-auth-token'] = '****';
    logger.debug(`REQ ${req.method} ${req.originalUrl}`, { headers: safeHeaders, body: maskSensitive(req.body) });
  } catch (e) {
    logger.debug('REQ logging failed', { err: e && e.message });
  }
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.debug(`RESP ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  req.logger = logger; // make logger available to routes
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/user');
const recordsRoutes = require('./routes/records');

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/records', recordsRoutes);

// Basic root
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Medical Appointment & Records API' });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check DB connection
    if (mongoose.connection.readyState === 1) {
      res.json({ status: 'ok', db: 'connected' });
    } else {
      res.status(500).json({ status: 'error', db: 'disconnected' });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = app;
