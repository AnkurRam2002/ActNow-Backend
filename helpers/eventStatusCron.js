const cron = require('node-cron');
const Event = require('../models/event.models'); 
const { TodayInstance } = require('twilio/lib/rest/api/v2010/account/usage/record/today');

const getOnlyDate = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Only YYYY-MM-DD
  };

// Cron job that runs every day at midnight to update events' status based on date
cron.schedule('*/1 * * * *', async () => {
  try {
    const today = getOnlyDate(new Date());

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 00:00:00
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // 23:59:59

    // Find all events whose date is less than or equal to today
    const eventsToUpdate = await Event.find({ 
        date: { $lt: todayEnd },
        status: 'Upcoming' 
    });

    // Update status of all such events to "Ongoing" or "Completed"
    for (let event of eventsToUpdate) {
        const eventDate = getOnlyDate(new Date(event.date)); 

      if (eventDate < todayStart) {
        event.status = 'Completed'; // Event is in the past
      } else if (eventDate.getTime() === today.getTime()) {
        event.status = 'Ongoing'; // Event is happening today
      }

      await event.save(); // Save the updated event status
      console.log(`Event "${event.name}" status updated to ${event.status}`);
    }
  } catch (err) {
    console.error('Error updating event statuses:', err);
  }
});