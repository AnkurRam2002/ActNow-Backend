const express = require("express");
const router = express.Router();
const Event = require("../models/event.models");
const auth = require("../helpers/authMiddleware");
const User = require("../models/user.models");
const webpush = require("web-push");

// Get all events
router.get("/", async (req, res) => {
  try {
    const { q, startDate, endDate } = req.query;
    const query = {
      ...(q && {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { location: { $regex: q, $options: "i" } },
          { requiredSkills: { $regex: q, $options: "i" } },
        ],
      }),

      ...(startDate && {
        date: { $gte: new Date(startDate) },
      }),
      ...(endDate && {
        date: { $lte: new Date(endDate) },
      }),
      ...(startDate &&
        endDate && {
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        }),
    };

    let events;
    if (q) {
      const users = await User.find({
        username: { $regex: q, $options: "i" },
      }).select("_id");
      const userIds = users.map((user) => user._id);
      query.$or.push({ organizer: { $in: userIds } });
    }

    events = await Event.find(query).populate("organizer", "username");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event by id
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "username"
    );
    if (!event) return res.status(404).json({ error: "Event not found." });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event
router.post("/create", auth, async (req, res) => {
  const {
    name,
    description,
    date,
    location,
    requiredSkills,
    volunteersNeeded,
  } = req.body;
  const skillsArray = Array.isArray(requiredSkills)
    ? requiredSkills
    : requiredSkills
    ? [requiredSkills]
    : [];

  try {
    const event = new Event({
      name,
      description,
      date,
      location,
      organizer: req.user.userId,
      requiredSkills: skillsArray,
      volunteersNeeded,
    });
    await event.save();

    const user = await User.findById(req.user.userId);
    user.eventsCreated.push(event._id);
    await user.save();

    res.status(201).json({
      message: "Event created successfully",
      eventId: event._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event details
router.put("/:id/edit", auth, async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      location,
      requiredSkills,
      volunteersNeeded,
    } = req.body;
    const skillsArray = Array.isArray(requiredSkills)
      ? requiredSkills
      : requiredSkills
      ? [requiredSkills]
      : [];

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user.userId },
      {
        name,
        description,
        date,
        location,
        requiredSkills: skillsArray,
        volunteersNeeded,
      },
      { new: true }
    );

    if (!event)
      return res
        .status(404)
        .json({ error: "Event not found or unauthorized." });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      organizer: req.user.userId,
    });

    if (!event)
      return res
        .status(404)
        .json({ error: "Event not found or unauthorized." });

    // Remove event from eventRegistered and eventCompleted for volunteers
    if (event.volunteersAssigned.length > 0) {
      await User.updateMany(
        { _id: { $in: event.volunteersAssigned } },
        {
          $pull: {
            eventsRegistered: req.params.id,
            eventsCompleted: req.params.id,
          },
        }
      );
    }
    // Remove event from eventCreated only for NGOs
    await User.updateOne(
      { _id: req.user.userId },
      { $pull: { eventsCreated: req.params.id } }
    );

    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get event participants
router.get("/:id/participants", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "volunteersAssigned",
      "username"
    );
    if (!event) return res.status(404).json({ error: "Event not found." });
    res.status(200).json(event.volunteersAssigned);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Participate in event
router.post("/:id/participate", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found." });

    if (event.volunteersAssigned.includes(req.user.userId)) {
      return res
        .status(400)
        .json({ error: "User already participating in event." });
    }

    event.volunteersAssigned.push(req.user.userId);
    await event.save();

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.eventsRegistered.push(req.params.id);
    await user.save();

    // ✅ Send push notification if user has subscription
    const subscription = user.pushSubscription;
    if (subscription) {
      const payload = JSON.stringify({
        title: "ActNow",
        body: `You successfully joined: ${event.name}`,
        icon: "/icon.png" // Update this path if needed
      });

      try {
        await webpush.sendNotification(subscription, payload);
      } catch (err) {
        console.error("Push notification error:", err);
      }
    }

    res.status(200).json({ message: "User added to event successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Undo participation in event
router.post("/:id/unparticipate", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found." });

    const userId = req.user.userId;

    if (!event.volunteersAssigned.includes(userId)) {
      return res
        .status(400)
        .json({ error: "User is not participating in this event." });
    }

    // Remove user from event
    event.volunteersAssigned = event.volunteersAssigned.filter(
      (volunteerId) => volunteerId.toString() !== userId
    );
    await event.save();

    // Remove event from user's registered list
    const user = await User.findById(userId);
    user.eventsRegistered = user.eventsRegistered.filter(
      (eventId) => eventId.toString() !== req.params.id
    );
    await user.save();

    res.status(200).json({ message: "Participation undone successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
