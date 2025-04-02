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

eventSchema.pre('save', function (next) {
  if (this.date) {
  this.date = moment(this.date).tz('Asia/Kolkata').toDate();
  } // Set the date to the current date in Asia/Kolkata timezone
  next();
});

module.exports = mongoose.model('Event', eventSchema);
