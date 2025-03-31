const express = require('express');
const router = express.Router();
const User = require('../models/user.models');

//Get user details by id -> new change
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('eventsRegistered', 'name date location') // Fetch event details
      .populate('eventsCompleted', 'name date location')
      .populate('eventsCreated', 'name date location');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
});

// Get registered events
router.get('/:id/eventsRegistered', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('eventsRegistered', 'name date location');
    res.json(user.eventsRegistered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registered events.' });
  }
});

// Get completed events
router.get('/:id/eventsCompleted', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('eventsCompleted', 'name date location');
    res.json(user.eventsCompleted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch completed events.' });
  }
});

module.exports = router;