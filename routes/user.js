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
      
      if (user.role === 'ngo' && user.eventsCreated) {
        userEvents = user.eventsCreated;
      } else if (user.role === 'volunteer' && user.eventsRegistered) {
        userEvents = user.eventsRegistered;
      } else {
        return res.status(404).json({ message: "No events found for user role" });
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

// Update user profile
router.put('/:id/edit', auth, async (req, res) => {
  try {
    // Make sure only the logged-in user can edit their profile
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized to edit this user profile.' });
    }

    const allowedUpdates = ['username', 'phoneNumber', 'skills', 'city'];
    const updates = {};

    for (let key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

// Delete user profile
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this user profile.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    // delete user id from events volunteerAssigned array
    if (user.eventsRegistered.length > 0) {
          await Event.updateMany(
            { _id: { $in: user.eventsRegistered } },
            {
              $pull: {
                volunteersAssigned: req.params.id
              }
            }
          );
        }

    if (user.eventsCreated.length > 0) {
          await Event.deleteMany(
            { _id: { $in: user.eventsCreated } },
            { organizer: req.params.id }
          );
        }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user profile.' });
  }
});

module.exports = router;
