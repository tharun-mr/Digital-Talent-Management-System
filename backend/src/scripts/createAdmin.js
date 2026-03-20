const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@talent.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      console.log('Email: admin@talent.com');
      console.log('Password: Admin@123456');
      process.exit(0);
    }
    
    // Create admin user
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@talent.com',
      password: 'Admin@123456',
      role: 'admin'
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@talent.com');
    console.log('🔑 Password: Admin@123456');
    console.log('🆔 User ID:', admin._id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdminUser();