const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  requiredSkills: {
    type: [String]
  },
  volunteersNeeded: {
      type: Number,
      required: true
    },
  volunteersAssigned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming'
  },

}, { timestamps: true });


module.exports = mongoose.model('Event', eventSchema);
