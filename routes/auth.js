const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const sendEmail = require('../middleware/emailService');

// User registration endpoint
router.post('/register', async (req, res) => {
    const { username, email, password, phone, city } = req.body; // Accept phone and city
    try {
        const user = new User({ 
            username, 
            email, 
            password, 
            phoneNumber: phone, // Store phone as phoneNumber
            city
        });
        await user.save();
        await sendEmail(email, "Welcome to ActNow", `Hello ${username},\n\nThank you for registering on our platform. We're excited to have you on board.\n\nBest Wishes,\nActNow Team`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        
        res.json({ 
            username: user.username, 
            userEmail: user.email,
            token  
        });
       
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User logout endpoint
router.post('/logout', async (req, res) => {
  
    try {
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