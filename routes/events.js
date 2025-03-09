const express = require("express");
const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const { q, startDate, endDate } = req.query;
    const query = {
      ...(q && {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } },
          { organizer: { $regex: q, $options: 'i' } },
          { requiredSkills: { $regex: q, $options: 'i' } }
        ]
      }),
      ...(startDate && endDate && {
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      })
    };
    const events = await Event.find(query).populate('organizer', 'username');
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
router.post('/create', async (req, res) => {
  const { title, description, date, location, requiredSkills, volunteersNeeded } = req.body;

  const skillsArray = Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? [requiredSkills] : []);

    try {
      const event = new Event({
        title,
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
  router.put('/:id', async (req, res) => {
    try {
      const { title, description, date, location, requiredSkills, volunteersNeeded } = req.body;

      const skillsArray = Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? [requiredSkills] : []);
  
      const event = await Event.findOneAndUpdate(
        { _id: req.params.id, organizer: req.user.userId }, // Ensure only the creator can update
        {
          title,
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
      const event = await Event.findById(req.params.id).populate('participants', 'username email');
      if (!event) return res.status(404).json({ error: 'Event not found.' });
      res.json(event.participants);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch participants.' });
    }
  });

module.exports = router;
