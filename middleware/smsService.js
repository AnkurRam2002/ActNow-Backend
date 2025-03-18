require('dotenv').config();
  const twilio = require('twilio');
  
  // Twilio client initialization
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,  
    process.env.TWILIO_AUTH_TOKEN    
  );
  
  // Function to send SMS
  const sendSMS = async (to, text) => {
    try {
      const message = await twilioClient.messages.create({
        body: `ActNow Customer Support Team: ${text}` ,
        to,
        from: process.env.TWILIO_PHONE_NUMBER  
      });
  
      console.log("SMS sent: ", message.sid);
    } catch (error) {
      console.error("Error sending SMS: ", error);
    }
  };
  
  module.exports = sendSMS;