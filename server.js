const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
require("./helpers/sendCertCron");
require("./helpers/eventStatusCron");

// Import Routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const userRoutes = require("./routes/user");
const passRoutes = require("./routes/pass");
const chatbotRoutes = require("./routes/chatbot");
const pushRoutes = require("./routes/pushrouter");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api", passRoutes);
app.use("/api", chatbotRoutes);
app.use("/api/push", pushRoutes);

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
