const express = require('express');
const User = require('../models/user.models'); 
const router = express.Router();
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../helpers/emailService');
const sendSMS = require('../helpers/smsService');
const otpGenerator = require('otp-generator');
const otpStore = {}; 

/* Forgot Password */
router.post('/forgot-password', async (req, res) => {
  const { email, phone } = req.body;

  // Validate request: At least email or phone number should be provided
  if (!email && !phone) {
    return res.status(400).json({ message: "Email or phone number is required" });
  }

  try {
    // Generate OTP
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const identifier = email || phone;

    // Store OTP with expiration time of 10 minutes
    otpStore[identifier] = { 
      otp, 
      expiresAt: Date.now() + 10 * 60 * 1000 
    };

    console.log('OTP is', otpStore[identifier].otp);
    console.log('Expires at', new Date(otpStore[identifier].expiresAt).toLocaleString());

    // Send OTP via Email or SMS
    if (email) {
      await sendEmail(
        email, 
        "Password Reset OTP", 
        `You are receiving this email because you have requested an OTP to change your password. Your OTP is: ${otp}. Valid for 10 minutes`
      );
      return res.status(200).json({ message: "OTP sent to your email" });
    } else {
      await sendSMS(
        phone,
        `Your password reset OTP is: ${otp}. Valid for 10 minutes.`
      );
      return res.status(200).json({ message: "OTP sent to your phone" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

/* Reset Password */
router.post('/reset-password', async (req, res) => {
  const { email, phone, otp, newPassword } = req.body;
  const identifier = email || phone;
  console.log(identifier);

  try {
    // Check if OTP exists
    if (!otpStore[identifier]) {
      return res.status(404).json({ message: "OTP not found or expired" });
    }

    // Check if OTP has expired
    if (Date.now() > otpStore[identifier].expiresAt) {
      delete otpStore[identifier];
      return res.status(410).json({ message: "OTP has expired. Please request a new one." });
    }

    // Validate OTP
    if (otpStore[identifier].otp.toString() !== otp.toString()) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Find user by email or phone number and update password
    const query = {};
    if (email) {
      query.email = email;
    } else if (phone) {
      query.phoneNumber = phone;
    }

    const user = await User.findOneAndUpdate(query, { password: hashedPassword });

    // If user not found, return appropriate error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete OTP after successful password reset
    delete otpStore[identifier];

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
  
