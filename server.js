const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

require("dotenv").config();
require("./helpers/sendCertCron");
require("./helpers/eventStatusCron");
require("./helpers/activityListener");
require('./helpers/notificationScheduler');

// Import Routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const userRoutes = require("./routes/user");
const passRoutes = require("./routes/pass");
const chatbotRoutes = require("./routes/chatbot");
const pushRoutes = require("./routes/pushrouter");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require('./routes/payment');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pass", passRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/receipts", express.static(path.join(__dirname, 'helpers', "receipts")));

app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
}); // Health check endpoint

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Basic route
app.get("/", (req, res) => {
  res.send("🚀 Volunteer Management API is Running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
