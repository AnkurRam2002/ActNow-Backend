require('dotenv').config();
const nodemailer = require('nodemailer');

// Transporter to send email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Secure email from .env
    pass: process.env.EMAIL_PASS   // Secure password from .env
  }
});

// Function to send email
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"ActNow Customer Support Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

module.exports = sendEmail;