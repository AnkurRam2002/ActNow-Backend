const cron = require('node-cron');
const Event = require('../models/event.models');
const User = require('../models/user.models');
const webpush = require('web-push');

// Make sure VAPID keys are set
webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Flag to prevent overlapping executions
let isJobRunning = false;

// ✅ Run every day at 11 AM server time
cron.schedule('* * * * *', async () => {
  // Prevent overlapping job execution
  if (isJobRunning) {
    console.log("Notification job already in progress. Skipping this run.");
    return;
  }

  try {
    isJobRunning = true;
    console.log(`Notification sending job started at: ${new Date().toISOString()}`);

    // Get today's date and tomorrow's date
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // set to 00:00
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find all events happening tomorrow
    const eventsTomorrow = await Event.find({
      date: { $gte: tomorrow, $lt: dayAfterTomorrow }
    }).populate('volunteersAssigned');

    console.log(`Found ${eventsTomorrow.length} events scheduled for tomorrow.`);

    for (const event of eventsTomorrow) {
      for (const volunteer of event.volunteersAssigned) {
        if (volunteer.pushSubscription) {
          const payload = JSON.stringify({
            title: "ActNow - Reminder 📅",
            body: `Reminder: Event "${event.name}" is happening tomorrow!`,
            icon: "/icon.png", // Update if needed
          });

          try {
            await webpush.sendNotification(volunteer.pushSubscription, payload);
          } catch (error) {
            console.error("Error sending reminder to user:", volunteer.username, error);
          }
        }
      }
    }

    console.log(`Notification sending job finished at: ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Critical error in notification sending job:", error);
  } finally {
    isJobRunning = false;
  }
});
