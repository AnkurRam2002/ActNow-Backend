const express = require('express');
const { getAIResponse } = require('../helpers/googleAI'); 
const User = require('../models/user.models'); 
const Event = require('../models/event.models'); 
const auth = require('../helpers/authMiddleware')
const router = express.Router();

router.post('/chat', auth , async (req, res) => {
  const { message } = req.body;
  const userId = req.user.userId; 

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let responseMessage = '';

    // If the user asks about their registered events
    if (message.toLowerCase().includes('registered events')) {
      const registeredEvents = await Event.find({ _id: { $in: user.eventsRegistered } });
      if (registeredEvents.length === 0) {
        responseMessage = "You are not registered for any events.";
      } else {
        responseMessage = `You are registered for the following events:\n` + 
          registeredEvents.map(event => `• ${event.name} on ${event.date.toLocaleDateString()}`).join('\n');
      }
    }
    // If the user asks about their completed events 
    else if (message.toLowerCase().includes('completed events')) {
      const completedEvents = await Event.find({ _id: { $in: user.eventsCompleted } });
      if (completedEvents.length === 0) {
        responseMessage = "You haven't completed any events yet.";
      } else {
        responseMessage = `You have completed the following events:\n` + 
          completedEvents.map(event => `• ${event.name} on ${event.date.toLocaleDateString()}`).join('\n');
      }
    }
    // If the user asks about their upcoming events
    else if (message.toLowerCase().includes('upcoming events')) {
      const upcomingEvents = await Event.find({ 
        _id: { $in: user.eventsRegistered },
        date: { $gt: new Date() } 
      });
      if (upcomingEvents.length === 0) {
        responseMessage = "You don't have any upcoming events.";
      } else {
        responseMessage = `You are registered for the following upcoming events:\n` + 
          upcomingEvents.map(event => `• ${event.name} on ${event.date.toLocaleDateString()}`).join('\n');
      }
    } 
    
    else if (message.toLowerCase().includes('recommend some events')) {
    const allEvents = await Event.find({ date: { $gt: new Date() } });

    // Filter events by skill match or location match
    const matchedEvents = allEvents.filter(event => {
      const skillMatch = event.requiredSkills?.some(skill => user.skills?.includes(skill));
      const locationMatch = event.location?.toLowerCase() === user.location?.toLowerCase();
      return skillMatch || locationMatch;
    });

    if (matchedEvents.length === 0) {
      responseMessage = "I couldn't find any events that match your skills or location.";
    } else {
      // Prepare context for AI
      const prompt = `
      You are an event assistant AI. Based on the user's skills (${user.skills?.join(', ')}) and their location (${user.location}), recommend some events from the list below. Explain *why* each recommended event is a good fit.

      Event List:
      ${matchedEvents.map(event => 
      `• ${event.name} on ${event.date.toLocaleDateString()} at ${event.location}. Requires: ${event.requiredSkills?.join(', ')}`).join('\n\n')}
      Please recommend these events to the user in a friendly and conversational way. Be concise, explain why these events are a good match for them, and encourage them to register.Avoid using Markdown formatting (like **bold** or *italic*). Just use plain text and proper numbering.`.trim();
      responseMessage = await getAIResponse(prompt);
    }

  } else {
    responseMessage = await getAIResponse(message);
  }

  res.json({ reply: responseMessage });

} catch (error) {
  console.error('Error in /chat route:', error);
  res.status(500).json({ error: 'Failed to get AI response' });
}
});

module.exports = router;

