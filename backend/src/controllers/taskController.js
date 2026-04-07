const Task = require('../models/Task');

// @desc    Get all tasks (admin sees all, users see only their assigned tasks)
const getTasks = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { assignedTo: req.user.id };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single task
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Non-admin users can only view their own tasks
    if (req.user.role !== 'admin' && task.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this task' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create task (admin only)
const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      assignedBy: req.user.id
    };
    const task = await Task.create(taskData);
    const populated = await task.populate('assignedTo', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update task (admin only)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete task (admin only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update task status only
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Non-admin users can only update status of their own tasks
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(200).json({ success: true, data: updatedTask });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Add comment to task
const addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Non-admin users can only comment on their own tasks
    if (req.user.role !== 'admin' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to comment on this task' });
    }

    task.comments.push({ user: req.user.id, comment: req.body.comment });
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get tasks by status
const getTasksByStatus = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { status: req.params.status }
      : { status: req.params.status, assignedTo: req.user.id };

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get task statistics
const getTaskStats = async (req, res) => {
  try {
    const matchStage = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };

    const stats = await Task.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment,
  getTasksByStatus,
  getTaskStats
};