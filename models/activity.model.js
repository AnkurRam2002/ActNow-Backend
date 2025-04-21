const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: { 
    type: String,
    enum: ['event-create', 
           'event-edit', 
           'event-delete',
           'event-participate',
           'event-unparticipate',
           'user-register',
           'user-login',
           'user-logout',
           'user-edit',
           'user-delete',
          ],
    default: null,
    required: true
},
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
},

  metadata: mongoose.Schema.Types.Mixed,

  createdAt: { 
    type: Date, 
    default: Date.now 
}
});

module.exports = mongoose.model('Activity', activitySchema);
