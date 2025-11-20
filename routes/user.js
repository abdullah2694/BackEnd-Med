const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { logger, maskSensitive } = require('../lib/logger');

const User = require('../models/User');

// GET /profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email phone');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    return res.json({ user });
  } catch (err) {
    logger.error('Get profile error', { err: err && err.message ? err.message : err, user: req.user && req.user.id });
    return res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /update
router.put('/update', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('name email phone');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    return res.json({ user });
  } catch (err) {
    logger.error('Update profile error', { err: err && err.message ? err.message : err, body: maskSensitive(req.body), user: req.user && req.user.id });
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
