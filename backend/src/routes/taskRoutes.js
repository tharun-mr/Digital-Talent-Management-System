const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment,
  getTasksByStatus,
  getTaskStats
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Task routes
router.route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask); // Only admin can create tasks

// Statistics and filtering routes
router.get('/stats/overview', getTaskStats);
router.get('/status/:status', getTasksByStatus);

// Status update route (for dropdown status change)
router.patch('/:id/status', updateTaskStatus);

// Individual task routes
router.route('/:id')
  .get(getTask)
  .put(updateTask)  // Admin can update any task
  .delete(authorize('admin'), deleteTask); // Only admin can delete tasks

// Comments route
router.post('/:id/comments', addComment);

module.exports = router;