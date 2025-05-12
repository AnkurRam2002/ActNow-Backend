const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PendingRegistration = require('../models/pending.model');
const User = require('../models/user.models');
const upload = require('../helpers/multerConfig'); 
const activityEmitter = require('../helpers/activityEmitter');
const auth = require('../helpers/authMiddleware');

// User registration request to be approved by admin
router.post('/register', upload.single('idPdf'), async (req, res) => {
    try {
      const { username, email, password, role, phone, skills, city } = req.body;

      const existingUser = await User.find({ email });
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      const newPending = new PendingRegistration({
        username,
        email,
        password,
        role,
        phoneNumber: phone,
        skills: Array.isArray(skills) ? skills : skills ? [skills] : [],
        city,
        idPdf: req.file.path
      });
  
      await newPending.save();
  
      res.json({ message: 'Registration submitted for approval!' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


// User login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        activityEmitter.emit('user-login', { userId: user._id });

        res.status(200).json({  
            username: user.username, 
            userEmail: user.email,
            userRole: user.role,
            token  
        });
       
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User logout endpoint
router.post('/logout', auth, async (req, res) => {
    try {

        activityEmitter.emit('user-logout', { userId: req.user.userId });

        return res.status(200).json({
            success: true,
            message: "Logged Out Successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
