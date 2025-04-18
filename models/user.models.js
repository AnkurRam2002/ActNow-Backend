const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    default: 'volunteer'
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
  }],
  eventsCreated: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }],
    pushSubscription: {
      endpoint: String,
      expirationTime: Date,
      keys: {
        p256dh: String,
        auth: String
      }
    }
  }, { timestamps: true });

userSchema.pre('save', function (next) {
  if (this.role === 'ngo') {
    this.eventsRegistered = undefined; // Remove for NGO users
    this.eventsCompleted = undefined; // Remove for NGO users
  } else if (this.role === 'volunteer') {
    this.eventsCreated = undefined; // Remove for volunteer users
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);

