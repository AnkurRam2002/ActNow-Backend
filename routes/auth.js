const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const sendEmail = require('../middleware/emailService');

// User registration endpoint
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({ username, email, password: hashedPassword });
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
        
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } 
        );
        
        
        res.json({ 
            username: user.username, 
            userEmail: user.email,
            token: token  
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