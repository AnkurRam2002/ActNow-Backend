const Activity = require('../models/activity.model');
const activityEmitter = require('./activityEmitter');

//User Login
activityEmitter.on('user-login', async ({ userId }) => {
    try {
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
activityEmitter.on('user-logout', async ({ userId }) => {
  try {
    const activity = await Activity.create({
      action: 'user-logout',
      user: userId,
      metadata: {}
    });
    console.log(`✅ Activity Logged: uer-logout for user ${userId}`, activity);
  } catch (error) {
    console.error('❌ Error logging activity:', error.message);
  }
});

//User Registration
activityEmitter.on('user-register', async ({ userId, email }) => {
  try {
    const activity = await Activity.create({
      action: 'user-register',
      user: userId,
      metadata: { email }
    });
    console.log(`✅ Activity Logged: user-register for user ${userId}`, activity);
  } catch (error) {
    console.error('❌ Error logging activity:', error.message);
  }
});
