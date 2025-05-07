const express = require('express');
const Activity = require('../models/activity.model');
const PendingRegistration = require('../models/pending.model');
const User = require('../models/user.models'); 
const router = express.Router();
const { sendEmail } = require('../helpers/emailService');

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

// 📄 Get all pending registrations
router.get('/pending-registrations', async (req, res) => {
  try {
    const pending = await PendingRegistration.find();
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📑 Approve a registration
router.post('/approve/:id', async (req, res) => {
  try {
    const pending = await PendingRegistration.findById(req.params.id);
    if (!pending) return res.status(404).json({ message: 'Not found' });

    // Create User from pending
    const newUser = new User({
      username: pending.username,
      email: pending.email,
      password: pending.password,
      role: pending.role,
      phoneNumber: pending.phoneNumber,
      skills: pending.skills,
      city: pending.city,
      idPdf: pending.idPdf
    });

    await newUser.save();
    await pending.deleteOne();

    // Send email to user about approval
    const emailContent = `Hello ${pending.username},\n\nYour registration has been approved. You can now log in to the system.\n\nBest regards,\nAdmin Team`;
    await sendEmail(pending.email, 'Registration Approved', emailContent);

    res.json({ message: 'Registration approved and user added!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ Reject a registration
router.delete('/reject/:id', async (req, res) => {
  try {
    const pending = await PendingRegistration.findByIdAndDelete(req.params.id);
    if (!pending) return res.status(404).json({ message: 'Not found' });

    // Send email to user about rejection
    const emailContent = `Hello ${pending.username},\n\nYour registration has been rejected. If you have any questions, please contact support.\n\nBest regards,\nAdmin Team`;
    await sendEmail(pending.email, 'Registration Rejected', emailContent);

    res.json({ message: 'Registration rejected and deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;