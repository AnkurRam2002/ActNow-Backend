const express = require('express');
const router = express.Router();
const User = require('../models/user.models');
const auth = require('../helpers/authMiddleware');
const Event = require('../models/event.models');

// Get user details by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('eventsRegistered', 'name date location')
      .populate('eventsCompleted', 'name date location')
      .populate('eventsCreated', 'name date location');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
});

// Get registered events
router.get('/:id/eventsRegistered', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('eventsRegistered', 'name date location');
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user.eventsRegistered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registered events.' });
  }
});

// Get completed events
router.get('/:id/eventsCompleted', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('eventsCompleted', 'name date location');
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user.eventsCompleted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch completed events.' });
  }
});

// Get created events
router.get('/:id/eventsCreated', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('eventsCreated', 'name date location');
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user.eventsCreated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch created events.' });
  }
});

router.get('/:id/myEvents', async (req, res) => {
  try {
    const { q, startDate, endDate } = req.query;
    const userId = req.params.id;

    // Initialize an empty array for user events
    let userEvents = [];

    // Fetch the user and get their events
    if (userId) {
      const user = await User.findById(userId);
      
      if (user && user.eventsCreated) {
        userEvents = user.eventsCreated; 
      } else {
        return res.status(404).json({ message: "User not found" });
      } 

      if (user && user.eventsRegistered) {
        userEvents = user.eventsRegistered;
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    }

    // Construct the base query
    let query = { _id: { $in: userEvents } };

    // Add date filters if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { requiredSkills: { $regex: q, $options: 'i' } }
      ];

      const users = await User.find({ username: { $regex: q, $options: 'i' } }).select('_id');
      const userIds = users.map(user => user._id);
      query.$or.push({ organizer: { $in: userIds } });
    }

    const events = await Event.find(query).populate('organizer', 'username');
  
    res.status(200).json(events);
  } catch (error) {
    console.error("Error in myEvents route:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
