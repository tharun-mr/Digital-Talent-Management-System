const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

const {
  register,
  login,
  logout,
  getMe,
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect);

router.post('/logout', logout);
router.get('/me', getMe);

// Admin routes
router.get('/users', authorize('admin'), getUsers);
router.get('/users/:id', authorize('admin'), getUser);
router.put('/users/:id', authorize('admin'), updateUser);
router.delete('/users/:id', authorize('admin'), deleteUser);

module.exports = router;