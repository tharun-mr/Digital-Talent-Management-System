const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Activity = require('../models/Activity');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'secretkey',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};


// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error.message);

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    // Duplicate key error (e.g. unique email)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if matchPassword method exists
    if (typeof user.matchPassword !== 'function') {
      console.error('LOGIN ERROR: matchPassword method not found on User model');
      return res.status(500).json({
        success: false,
        error: 'Authentication configuration error'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Log activity (non-blocking — don't fail login if this errors)
    try {
      await Activity.create({
        user: user._id,
        action: 'login',
        details: 'User logged in',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (activityErr) {
      console.warn('Activity log failed (login):', activityErr.message);
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};


// ================= LOGOUT =================
exports.logout = async (req, res) => {
  try {
    // Log activity (non-blocking)
    try {
      await Activity.create({
        user: req.user.id,
        action: 'logout',
        details: 'User logged out',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (activityErr) {
      console.warn('Activity log failed (logout):', activityErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('LOGOUT ERROR:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};


// ================= GET CURRENT USER =================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('GET ME ERROR:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};


// ================= GET ALL USERS =================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('name');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error('GET USERS ERROR:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};


// ================= GET SINGLE USER =================
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('GET USER ERROR:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};


// ================= UPDATE USER =================
exports.updateUser = async (req, res) => {
  try {
    // Prevent password update through this route
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('UPDATE USER ERROR:', error.message);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};


// ================= DELETE USER =================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('DELETE USER ERROR:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  }
};