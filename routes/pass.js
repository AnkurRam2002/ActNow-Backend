const express = require('express');
const User = require('../models/user'); 
const router = express.Router();
const bcrypt = require('bcryptjs');
const sendEmail = require('../middleware/emailService');

const otpStore = {}; 

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const otp = Math.floor(100000 + Math.random() * 900000); 
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
    console.log(otpStore[email]);
    await sendEmail(email, "Password Reset OTP", `You are recieving this email because you have requested an otp to change your password. Your OTP is: ${otp}`);

    res.json({ message: "OTP sent to your email", otp }); 
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
      if (!otpStore[email]) {
        return res.status(400).json({ message: "OTP not found or expired" });
     }
      if (otpStore[email].otp.toString() !== otp.toString()) {
        return res.status(400).json({ 
            message: `Invalid OTP. Stored: ${otpStore[email].otp}, Received: ${otp}`,
            storedOTP: otpStore[email]
        });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      await User.findOneAndUpdate({ email }, { password: hashedPassword });
  
      delete otpStore[email]; 
      res.json({ message: "Password reset successful" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  module.exports = router;
  
