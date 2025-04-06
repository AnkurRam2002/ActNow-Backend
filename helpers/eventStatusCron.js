const cron = require('node-cron');
const Event = require('../models/event.models'); 

const getOnlyDate = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Only YYYY-MM-DD
  };

// Cron job that runs every day at midnight to update events' status based on date

let isJobRunning = false;

cron.schedule('*/50 * * * *', async () => {

  if (isJobRunning) {
    console.log("Job already in progress. Skipping this run.");
    return;
  }

  try {
    isJobRunning = true;
    console.log(`Event status update job started at: ${new Date().toISOString()}`);
    
    const today = getOnlyDate(new Date());

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 00:00:00
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // 23:59:59

    // Find all events whose date is less than or equal to today
    const eventsToUpdate = await Event.find({ 
        date: { $lt: todayEnd },
        status: { $in: ['Upcoming', 'Ongoing'] }
    });

    // Update status of all such events to "Ongoing" or "Completed"
    for (let event of eventsToUpdate) {
        const eventDate = getOnlyDate(new Date(event.date)); 

        let newStatus = event.status;

        if (eventDate < todayStart) {
          newStatus = "Completed"; // Event is in the past
        } else if (eventDate.getTime() === today.getTime() && event.status !== "Ongoing") {
          newStatus = "Ongoing"; // Event is happening today
        }
  
        // Only update if the status actually changes
        if (event.status !== newStatus) {
          event.status = newStatus;
          await event.save();
          console.log(`Event "${event.name}" status updated to ${event.status}`);
        }
    }

    console.log(`Event status update job completed at: ${new Date().toISOString()}`);
  } catch (err) {
    console.error('Error updating event statuses:', err);
  } finally {
    isJobRunning = false;
  }
});