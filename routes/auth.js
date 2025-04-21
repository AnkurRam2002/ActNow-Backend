const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.models');
const { sendEmail } = require('../helpers/emailService');
const activityEmitter = require('../helpers/activityEmitter');

// User registration endpoint
router.post('/register', async (req, res) => {
    const { username, email, password, phone, city, role, skills } = req.body;
    try {
        const user = new User({ 
            username, 
            email, 
            password, 
            phoneNumber: phone, 
            city,
            role,
            skills: Array.isArray(skills) ? skills : skills ? [skills] : []
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

        console.log('Emitting user-login event for userId:', user._id);
        
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
