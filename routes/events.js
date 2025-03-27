const express = require("express");
const router = express.Router();
const Event = require('../models/event.models');
const auth = require('../middleware/authMiddleware');
const User = require("../models/user.models");

// Get all events
router.get('/', async (req, res) => {
  try {
    const { q, startDate, endDate } = req.query;
    const query = {
      ...(q && {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
          // { organizer: { $regex: q, $options: 'i' } },
          { requiredSkills: { $regex: q, $options: 'i' } }
        ]
      }),
      ...(startDate && endDate && {
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      })
    };

    // Get events by organizer query
    let events;
    if (q) {
      // Find users matching the query
      const users = await User.find({ username: { $regex: q, $options: 'i' } }).select('_id');
      const userIds = users.map(user => user._id);

      // Add organizer filter to the query
      query.$or.push({ organizer: { $in: userIds } });
    }

    events = await Event.find(query).populate('organizer', 'username');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event by id
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'username');
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event
router.post('/create', auth , async (req, res) => {
  const { name, description, date, location, requiredSkills, volunteersNeeded } = req.body;

  const skillsArray = Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? [requiredSkills] : []);

    try {
      const event = new Event({
        name,
        description,
        date,
        location,
        organizer: req.user.userId,
        requiredSkills: skillsArray,
        volunteersNeeded,
      });
      await event.save();
      res.status(201).json({ message: 'Event created successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update event details
  router.put('/:id', auth , async (req, res) => {
    try {
      const { name, description, date, location, requiredSkills, volunteersNeeded } = req.body;

      const skillsArray = Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? [requiredSkills] : []);
  
      const event = await Event.findOneAndUpdate(
        { _id: req.params.id, organizer: req.user.userId }, // Ensure only the creator can update
        {
          name,
          description,
          date,
          location,
          requiredSkills: skillsArray,  
          volunteersNeeded  
        },
        { new: true } 
      );
  
      if (!event) return res.status(404).json({ error: 'Event not found or unauthorized.' });
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update event.' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const event = await Event.findOneAndDelete(
        { _id: req.params.id, organizer: req.user.userId } // Ensure only the creator can delete
      );
  
      if (!event) return res.status(404).json({ error: 'Event not found or unauthorized.' });
  
      res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete event.' });
    }
  });
  
  // Get event participants
  router.get('/:id/participants', async (req, res) => {
    try {
      const event = await Event.findById(req.params.id).populate('volunteersAssigned', 'username');
      if (!event) return res.status(404).json({ error: 'Event not found.' });
      res.json(event.volunteersAssigned);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch participants.' });
    }
  });

  router.post('/:id/participate', auth, async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ error: 'Event not found.' });
  
      if (event.volunteersAssigned.includes(req.user.userId)) {
        return res.status(400).json({ error: 'User already participating in event.' });
      }
  
      event.volunteersAssigned.push(req.user.userId);
      await event.save();

      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      user.eventsRegistered.push(req.params.id);
      await user.save();
  
      res.json({ message: 'User added to event successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add user to event.' });
    }
  });

module.exports = router;
