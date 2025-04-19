const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const auth = require('../helpers/authMiddleware');
const User = require('../models/user.models');

webpush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ✅ Save subscription to user
router.post('/subscribe', auth, async (req, res) => {
  try {
    const subscription = req.body.subscription;
    const userId = req.user.userId;

    await User.findByIdAndUpdate(userId, { pushSubscription: subscription });

    res.status(201).json({ message: "Subscription stored." });
  } catch (error) {
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

// ❌ Only for testing all subscriptions — you can remove this later
router.post('/notify-all', async (req, res) => {
  const users = await User.find({ pushSubscription: { $exists: true } });

  const payload = JSON.stringify({
    title: "ActNow",
    body: "You have a new notification!",
    icon: "/icon.png",
  });

  try {
    await Promise.all(users.map(user => {
      return webpush.sendNotification(user.pushSubscription, payload);
    }));
    res.sendStatus(200);
  } catch (err) {
    console.error("Push error:", err);
    res.sendStatus(500);
  }
});

module.exports = router;
