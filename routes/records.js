const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Record = require('../models/Record');

// GET /
router.get('/', auth, async (req, res) => {
  try {
    const records = await Record.find({ user: req.user.id }).sort({ uploadedAt: -1 });
    return res.json({ records });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

// POST /upload
router.post('/upload', auth, async (req, res) => {
  try {
    const { title, fileUrl } = req.body;
    if (!title || !fileUrl) return res.status(400).json({ msg: 'title and fileUrl are required' });

    const rec = new Record({ user: req.user.id, title, fileUrl });
    await rec.save();
    return res.json({ msg: 'Record uploaded', record: rec });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
