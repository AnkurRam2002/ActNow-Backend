const express = require('express');
const User = require('../models/user'); 
const router = express.Router();
const bcrypt = require('bcryptjs');
const sendEmail = require('../middleware/emailService');
const sendSMS = require('../middleware/smsService');
const otpGenerator = require('otp-generator');
const otpStore = {}; 


/* Forgot Password */
router.post('/forgot-password', async (req, res) => {
  const { email, phoneNumber } = req.body;
  
  if (!email && !phoneNumber) {
    return res.status(400).json({ message: "Email or phone number is required" });
  }
  
  try {
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const identifier = email || phoneNumber;
    
    otpStore[identifier] = { 
      otp, 
      expiresAt: Date.now() + 10 * 60 * 1000 
    };
    
    console.log(otpStore[identifier]);
    
    if (email) {
      await sendEmail(
        email, 
        "Password Reset OTP", 
        `You are receiving this email because you have requested an OTP to change your password. Your OTP is: ${otp}. Valid for 10 minutes`
      );
      res.json({ message: "OTP sent to your email" });

    } else {
      await sendSMS(
        phoneNumber,
        `Your password reset OTP is: ${otp}. Valid for 10 minutes.`
      );
      res.json({ message: "OTP sent to your phone" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

/* Reset Password */
router.post('/reset-password', async (req, res) => {
  const { email, phoneNumber, otp, newPassword } = req.body;
  const identifier = email || phoneNumber;
  
  try {
    if (!otpStore[identifier]) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (Date.now() > otpStore[identifier].expiresAt) {
      delete otpStore[identifier];
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }
    
    if (otpStore[identifier].otp.toString() !== otp.toString()) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const query = {};
    if (email) {
      query.email = email;
    } else if (phoneNumber) {
      query.phoneNumber = phoneNumber;
    }
    
    await User.findOneAndUpdate(query, { password: hashedPassword });
    
    delete otpStore[identifier];
    
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



/*Forgot Password
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

//Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
      if (!otpStore[email]) {
          return res.status(400).json({ message: "OTP not found" });
      }

      // Check if OTP has expired
      if (Date.now() > otpStore[email].expiresAt) {
          delete otpStore[email];
          return res.status(400).json({ message: "OTP has expired. Please request a new one." });
      }

     
      if (otpStore[email].otp.toString() !== otp.toString()) {
          return res.status(400).json({ message: "Invalid OTP." });
      }

     
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

     
      await User.findOneAndUpdate({ email }, { password: hashedPassword });

      delete otpStore[email]; 
      res.json({ message: "Password reset successful" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});*/

  
  module.exports = router;
  
