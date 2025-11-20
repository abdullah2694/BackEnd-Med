const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { logger, maskSensitive } = require('../lib/logger');

const Appointment = require('../models/Appointment');

const DOCTORS = [
  {
    name: 'Dr. Ahmed',
    avatar: 'https://ui-avatars.com/api/?name=Dr+Ahmed',
    designation: 'Cardiologist',
    rating: 4.8,
    specialties: ['Cardiology', 'Hypertension'],
    bio: 'Experienced cardiologist with 10+ years in patient care.',
  },
  {
    name: 'Dr. Fatima',
    avatar: 'https://ui-avatars.com/api/?name=Dr+Fatima',
    designation: 'Pediatrician',
    rating: 4.7,
    specialties: ['Pediatrics', 'Neonatology'],
    bio: 'Compassionate pediatrician focused on child health and development.',
  },
  {
    name: 'Dr. Ali',
    avatar: 'https://ui-avatars.com/api/?name=Dr+Ali',
    designation: 'General Practitioner',
    rating: 4.6,
    specialties: ['General Medicine', 'Family Medicine'],
    bio: 'General practitioner covering a wide range of common conditions.',
  },
];

// GET /doctors - public list of available doctors with metadata
router.get('/doctors', (req, res) => {
  try {
    const list = DOCTORS.map(({ name, avatar, designation, rating, specialties, bio }) => ({ name, avatar, designation, rating, specialties, bio }));
    return res.json({ doctors: list });
  } catch (err) {
    logger.error('Appointment booking error', { err: err && err.message ? err.message : err, body: maskSensitive(req.body) });
    return res.status(500).json({ msg: 'Server error' });
  }
});

// POST /book
router.post('/book', auth, async (req, res) => {
  try {
    const { doctor, date, time } = req.body || {};
    if (!doctor || !date || !time) return res.status(400).json({ msg: 'doctor, date and time are required' });
    const doctorObj = DOCTORS.find((d) => d.name === doctor);
    if (!doctorObj) return res.status(400).json({ msg: 'Invalid doctor' });

    // Normalize date to ISO date (no time) for clash detection
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) return res.status(400).json({ msg: 'Invalid date' });

    // Clash detection: same doctor + same date (calendar date) + same time and not Cancelled
    const dayStart = new Date(appointmentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const clash = await Appointment.findOne({
      doctor,
      time,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'Cancelled' },
    });

    if (clash) return res.status(400).json({ msg: 'Slot unavailable' });

    const appt = new Appointment({ user: req.user.id, doctor: doctorObj.name, date: appointmentDate, time, status: 'Confirmed' });
    await appt.save();
    // Include doctor metadata in the response for convenience
    return res.json({ msg: 'Appointment booked', appointment: appt, doctor: doctorObj });
  } catch (err) {
    logger.error('Fetch upcoming appointments error', { err: err && err.message ? err.message : err, user: req.user && req.user.id });
    return res.status(500).json({ msg: 'Server error' });
  }
});

// GET /upcoming
router.get('/upcoming', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appts = await Appointment.find({ user: req.user.id, date: { $gte: today } }).sort({ date: 1, time: 1 });
    return res.json({ appointments: appts });
  } catch (err) {
    logger.error('Fetch history appointments error', { err: err && err.message ? err.message : err, user: req.user && req.user.id });
    return res.status(500).json({ msg: 'Server error' });
  }
});

// GET /history
router.get('/history', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appts = await Appointment.find({ user: req.user.id, date: { $lt: today } }).sort({ date: -1, time: -1 });
    return res.json({ appointments: appts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
