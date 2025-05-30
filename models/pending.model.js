const mongoose = require("mongoose");

const pendingSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['volunteer', 'ngo'],
    required: true
  },
  phoneNumber: String,

  skills: [String],

  city: String,
  
  idPdf: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Pending", pendingSchema);
