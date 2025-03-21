require('dotenv').config();
const twilio = require('twilio');

// Twilio client initialization
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

// Function to send SMS
const sendSMS = async (to, text) => {
  try {
    // Format the phone number with +91 prefix if it doesn't already start with +
    let formattedNumber = to;
    if (!to.startsWith('+')) {
      formattedNumber = `+91${to}`;
    }

    const message = await twilioClient.messages.create({
      body: `ActNow Customer Support Team: ${text}`,
      to: formattedNumber,
      from: '+19206333652'
    });

    console.log("SMS sent: ", message.sid);
  } catch (error) {
    console.error("Error sending SMS: ", error);
  }
};

module.exports = sendSMS;