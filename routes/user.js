const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Get registered events
router.get('/:id/eventsRegistered', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('eventsRegistered', 'title date location');
    res.json(user.eventsRegistered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registered events.' });
  }
});

// Get completed events
router.get('/:id/eventsCompleted', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('eventsCompleted', 'title date location');
    res.json(user.eventsCompleted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch completed events.' });
  }
});

module.exports = router;