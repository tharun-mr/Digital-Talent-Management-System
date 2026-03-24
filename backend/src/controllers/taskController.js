const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity'); // Add this import

// @desc    Create a new task (Admin only)
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority, category } = req.body;

    // Check if assigned user exists
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      dueDate,
      priority,
      category
    });

    // Track task creation activity
    await Activity.create({
      user: req.user.id,
      action: 'task_created',
      details: `Created task "${title}" assigned to ${user.name}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || ''
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};

// @desc    Get all tasks (Admin gets all, User gets their tasks)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query;
    
    if (req.user.role === 'admin') {
      query = Task.find();
    } else {
      query = Task.find({ assignedTo: req.user.id });
    }

    const tasks = await query
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort('-createdAt');

    // Track task view activity (only for users, not admins to avoid spam)
    if (req.user.role !== 'admin') {
      await Activity.create({
        user: req.user.id,
        action: 'task_viewed',
        details: `Viewed ${tasks.length} tasks`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
        userAgent: req.headers['user-agent'] || ''
      });
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (req.user.role !== 'admin' && task.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }

    // Track status change activity
    if (req.body.status && req.body.status !== task.status) {
      await Activity.create({
        user: req.user.id,
        action: 'task_updated',
        details: `Changed task "${task.title}" status from ${task.status} to ${req.body.status}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
        userAgent: req.headers['user-agent'] || ''
      });
    }

    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedAt = Date.now();
      
      // Track task completion activity
      await Activity.create({
        user: req.user.id,
        action: 'task_completed',
        details: `Completed task: ${task.title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
        userAgent: req.headers['user-agent'] || ''
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete task (Admin only)
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete tasks'
      });
    }

    // Track task deletion activity
    await Activity.create({
      user: req.user.id,
      action: 'task_deleted',
      details: `Deleted task: ${task.title} (was assigned to ${task.assignedTo})`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || ''
    });

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to comment on this task'
      });
    }

    task.comments.push({
      user: req.user.id,
      comment: req.body.comment
    });

    await task.save();

    // Track comment activity
    await Activity.create({
      user: req.user.id,
      action: 'comment_added',
      details: `Added comment to task: ${task.title}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || ''
    });

    const updatedTask = await Task.findById(req.params.id)
      .populate('comments.user', 'name email');

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get tasks by status
// @route   GET /api/tasks/status/:status
// @access  Private
exports.getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    let query = { status };

    if (req.user.role !== 'admin') {
      query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats/overview
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role !== 'admin') {
      matchQuery.assignedTo = req.user.id;
    }

    const stats = await Task.aggregate([
      { $match: matchQuery },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    
    const statusCounts = {
      total,
      pending: 0,
      'in-progress': 0,
      completed: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: statusCounts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};