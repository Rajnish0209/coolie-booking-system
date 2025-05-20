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

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/coolie-booking-system';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminUser) {
      console.log('Admin user does not exist! Creating new admin user...');
      
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
    } else {
      // Reset password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      adminUser.password = hashedPassword;
      await adminUser.save();
      
      console.log('Admin password reset successfully!');
    }
    
    console.log('You can now login with:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error resetting admin password:', error);
  }
}

resetAdminPassword(); 