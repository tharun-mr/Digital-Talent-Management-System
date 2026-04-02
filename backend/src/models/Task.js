const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  category: {
    type: String,
    enum: ['development', 'design', 'marketing', 'sales', 'support', 'other'],
    default: 'other'
  },
  attachments: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ priority: 1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for formatted due date
taskSchema.virtual('formattedDueDate').get(function() {
  return this.dueDate.toLocaleDateString();
});

// Method to update status with completion timestamp
taskSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  return await this.save();
};

// Static method to get task statistics for a user
taskSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: { 
        $or: [
          { assignedTo: mongoose.Types.ObjectId(userId) },
          { assignedBy: mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    pending: 0,
    'in-progress': 0,
    completed: 0,
    rejected: 0,
    total: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

// Static method to get tasks by category
taskSchema.statics.getTasksByCategory = async function(userId) {
  return await this.aggregate([
    {
      $match: { 
        $or: [
          { assignedTo: mongoose.Types.ObjectId(userId) },
          { assignedBy: mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = async function(userId) {
  return await this.find({
    $or: [
      { assignedTo: userId },
      { assignedBy: userId }
    ],
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  }).populate('assignedTo', 'name email')
    .populate('assignedBy', 'name email');
};

// Middleware to update timestamps
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);