const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { logger, maskSensitive } = require('./lib/logger');

dotenv.config();

const app = express();
app.use(cors());
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

module.exports = app;
