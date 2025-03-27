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

    console.log(`Email sent to ${to}: `, info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

// Function to send email with attachments
const sendAttachmentEmail = async (to, pdfPath, event) => {
  try {
    const info = await transporter.sendMail({
      from: `"ActNow Admin Team" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🎉 Congratulations! You've Completed ${event.name}!`, 
      text: `Dear Participant,\n\nCongratulations on successfully completing the event: ${event.name} held on ${new Date(event.date).toDateString()}.\n\nPlease find your completion certificate attached.\n\nBest Regards,\nEvent Team`,
      attachments: [
        {
          filename: `${event.name}_Completion_Certificate.pdf`, 
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    });

    console.log(`Email sent to ${to}: `, info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

module.exports = { sendEmail, sendAttachmentEmail };