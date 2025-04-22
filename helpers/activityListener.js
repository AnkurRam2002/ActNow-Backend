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

//User Edit
activityEmitter.on('user-edit', async ({ userId, changes }) => {
  try {
    const activity = await Activity.create({
      action: 'user-edit',
      user: userId,
      metadata: { changes }
    });
    console.log(`✅ Activity Logged: user-edit for user ${userId}`, activity);
  } catch (error) {
    console.error('❌ Error logging activity:', error.message);
  }
});

//User Delete
activityEmitter.on('user-delete', async ({ userId }) => {
  try {
    const activity = await Activity.create({
      action: 'user-delete',
      user: userId,
      metadata: {}
    });
    console.log(`✅ Activity Logged: user-delete for user ${userId}`, activity);
  } catch (error) {
    console.error('❌ Error logging activity:', error.message);
  }
});

//Event Create
activityEmitter.on('event-create', async ({ userId, eventName }) => {
  try {
    const activity = await Activity.create({
      action: 'event-create',
      user: userId,
      metadata: { eventName }
    });
    console.log(`✅ Activity Logged: event-create for user ${userId}`, activity);
  } catch (error) {
    console.error('❌ Error logging activity:', error.message);
  }
});

//Event Edit
activityEmitter.on('event-edit', async ({ userId, eventName }) => {
  try {
    const activity = await Activity.create({
      action: 'event-edit',
      user: userId,
      metadata: { eventName }
    });
    console.log(`✅ Activity Logged: event-edit for user ${userId}`, activity);
  } catch (error) {
    console.error('❌ Error logging activity:', error.message);
  }
});

//Event Delete
activityEmitter.on('event-delete', async ({ userId, eventName }) => {
  try {
    const activity = await Activity.create({
      action: 'event-delete',
      user: userId,
      metadata: { eventName }
    });
    console.log(`✅ Activity Logged: event-delete for user ${userId}`, activity);
  } catch (error) {
    console.error('❌ Error logging activity:', error.message);
  }
});
