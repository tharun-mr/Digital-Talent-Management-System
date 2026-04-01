const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'task_created',
      'task_updated',
      'task_deleted',
      'task_completed',
      'task_started',
      'task_viewed',
      'comment_added',
      'user_registered',
      'user_updated',
      'user_deleted'
    ]
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ action: 1 });

module.exports = mongoose.model('Activity', activitySchema);