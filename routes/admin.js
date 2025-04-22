const express = require('express');
const Activity = require('../models/activity.model');
const router = express.Router();

router.get('/activities', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { user: userId } : {};

    const activities = await Activity.find(query)
      .populate('user', 'username') 
      .sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
});

module.exports = router;