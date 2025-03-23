const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
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
  phoneNumber: {
    type: String
  },
  skills: {
    type: [String]
  },
  city: {
    type: String
  },
  eventsRegistered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  eventsCompleted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);

