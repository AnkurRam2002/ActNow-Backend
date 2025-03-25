const cron = require("node-cron");
const User = require("../models/user"); 
const Event = require("../models/event"); 

// Schedule the job to run every day at midnight (0 0 * * *)
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running scheduled event status update job...");

    // Fetch all users who have registered events
    const users = await User.find({ eventsRegistered: { $exists: true, $not: { $size: 0 } } });

    for (const user of users) {
      let updatedEventsRegistered = []; // To store future events
      let completedEvents = [...user.eventsCompleted]; // Keep existing completed events

      for (const eventId of user.eventsRegistered) {
        const event = await Event.findById(eventId);

        if (event && new Date(event.date) < new Date()) { 
          // If event date has passed, move it to completed
          completedEvents.push(eventId);
        } else {
          // Otherwise, keep it in registered
          updatedEventsRegistered.push(eventId);
        }
      }

      // Update the user document in MongoDB
      await User.findByIdAndUpdate(user._id, {
        eventsRegistered: updatedEventsRegistered,
        eventsCompleted: completedEvents,
      });
    }

    console.log("Event status update job completed successfully.");
  } catch (error) {
    console.error("Error updating event statuses:", error);
  }
});
