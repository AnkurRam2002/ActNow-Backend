require('dotenv').config();
const twilio = require('twilio');

// Twilio client initialization
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const sender = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = twilio(accountSid, authToken);

// Function to send SMS
const sendSMS = async (reciever, text) => {
  try {
    const message = await twilioClient.messages.create({
      body: `ActNow Customer Support Team: ${text}`,
      to: `+91${reciever}`,
      from: sender,
    });

    console.log("SMS sent: to", message.to);
  } catch (error) {
    console.error("Error sending SMS: ", error);
  }
};

module.exports = sendSMS;