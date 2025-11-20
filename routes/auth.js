const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logger, maskSensitive } = require('../lib/logger');

const User = require('../models/User');

// POST /signup
router.post('/signup', async (req, res) => {
  try {
    // Guard against missing/invalid JSON body
    const { name, email, password, phone } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ msg: 'Name, email and password are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashed, phone });
    await user.save();

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    logger.error('Signup error', { err: err && err.message ? err.message : err, body: maskSensitive(req.body) });
    // Handle duplicate key error (race condition)
    if (err && err.code === 11000) {
      return res.status(400).json({ msg: 'Email already registered' });
    }
    return res.status(500).json({ msg: 'Server error' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    // Guard against missing/invalid JSON body
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ msg: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    logger.error('Login error', { err: err && err.message ? err.message : err, body: maskSensitive(req.body) });
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
