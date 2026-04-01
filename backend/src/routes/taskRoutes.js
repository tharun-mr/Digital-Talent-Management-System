const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  addComment,
  getTasksByStatus,
  getTaskStats
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask); // Only admin can create tasks

router.get('/stats/overview', getTaskStats);
router.get('/status/:status', getTasksByStatus);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(authorize('admin'), deleteTask); // Only admin can delete tasks

router.post('/:id/comments', addComment);

module.exports = router;