const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
