const cron = require("node-cron");
const User = require("../models/user.models"); 
const Event = require("../models/event.models");
const generateCertificate = require("./generateCertificate");
const { sendAttachmentEmail } = require("./emailService");
const fs = require("fs");

// Schedule the job to run every day at midnight (0 0 * * *) || Test for every 5 minutes (*/5 * * * *)
let isJobRunning = false;

cron.schedule("*/60 * * * *", async () => {
   // Prevent concurrent job executions
   if (isJobRunning) {
     console.log("Job already in progress. Skipping this run.");
     return;
   }

   try {
     isJobRunning = true;
     console.log(`Event completion job started at: ${new Date().toISOString()}`);

     const users = await User.find({
       eventsRegistered: { $exists: true, $not: { $size: 0 } }
     }).lean(); // Use .lean() for better performance

     const processedUserIds = new Set();

     for (const user of users) {
       // Prevent processing the same user multiple times
       if (processedUserIds.has(user._id.toString())) continue;

       let completedEvents = [...user.eventsCompleted];
       let newlyCompletedEvents = [];

       for (const eventId of user.eventsRegistered) {
         // Check if event is not already in completed events
         if (!completedEvents.some(completedId => completedId.equals(eventId))) {
           const event = await Event.findById(eventId);

           if (event.status === "Completed") {
             completedEvents.push(eventId);
             newlyCompletedEvents.push(event);
           }
         }
       }

       if (newlyCompletedEvents.length > 0) {
         for (const event of newlyCompletedEvents) {
           console.log(`Processing event completion for User ${user.username}: ${event.name}`);

           try {
             // Generate PDF Certificate 
             const pdfPath = await generateCertificate(user.username, event);

             // Send Email
             await sendAttachmentEmail(user.email, pdfPath, event);

             // Remove temp file after sending email
             fs.unlinkSync(pdfPath);
           } catch (emailError) {
             console.error(`Error processing event ${event.name} for ${user.username}:`, emailError);
           }
         }

         // Update user in MongoDB
         await User.findByIdAndUpdate(user._id, {
           eventsCompleted: completedEvents,
         });

         // Mark user as processed
         processedUserIds.add(user._id.toString());
       }
     }

     console.log(`Event completion job finished at: ${new Date().toISOString()}`);
   } catch (error) {
     console.error("Critical error in event completion job:", error);
   } finally {
     isJobRunning = false;
   }
});