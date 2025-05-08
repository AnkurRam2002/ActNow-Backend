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

const transporter2 = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.RECEIPT_EMAIL_USER,
    pass: process.env.RECEIPT_EMAIL_PASS,
  },
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

// Function to send receipt email
const sendReceiptEmail = async (to, receiptPath, name, amount) => {
  try {
    const info = await transporter2.sendMail({
      from: `"ActNow Support Team" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Thank You for Your Donation, ${name}!`,
      text: `Dear ${name},\n\nThank you for your generous donation of ₹${amount}. Please find your donation receipt attached.\n\nBest Regards,\nActNow Support Team`,
      attachments: [
        {
          filename: `Donation_Receipt_${name}.pdf`,
          path: receiptPath,
          contentType: "application/pdf",
        },
      ],
    });

    console.log(`Receipt email sent to ${to}: `, info.response);
  } catch (error) {
    console.error("Error sending receipt email: ", error);
  }
};

module.exports = { sendEmail, sendAttachmentEmail, sendReceiptEmail };