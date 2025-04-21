const Activity = require('../models/activity.model');
const activityEmitter = require('./activityEmitter');

//User Login
activityEmitter.on('user-login', async ({ userId }) => {
    try {
      console.log(`Attempting to log activity for userId: ${userId}`);
      const activity = await Activity.create({
        action: 'user-login',
        user: userId,
        metadata: {}
      });
      console.log(`✅ Activity Logged: user-login for user ${userId}`, activity);
    } catch (error) {
      console.error('❌ Error logging activity:', error.message);
    }
  });

//User Logout
activityEmitter.on('user-logout', async ({ userId, event }) => {
  try {
    await Activity.create({
      action: 'user-logout',
      user: userId,
      metadata: {
        eventId: event._id,
        eventName: event.name,
        eventDate: event.date,
        eventLocation: event.location
      }
    });
    console.log(`✅ Activity Logged: ${action}`);
  } catch (error) {
    console.error('❌ Error logging activity:', error.message);
  }
});
