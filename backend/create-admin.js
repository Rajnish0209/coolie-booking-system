const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Define User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/coolie-booking-system';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('You can login with:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      await mongoose.connection.close();
      return;
    }
    
    // Create a hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin'
    });
    
    await admin.save();
    console.log('Admin user created successfully!');
    console.log('You can login with:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdmin(); 