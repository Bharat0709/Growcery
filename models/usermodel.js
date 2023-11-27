const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [false, 'Please enter your Name'],
  },
  mobile: {
    type: String,
    required: [true, 'Please enter your Mobile Number'],
    unique: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Define the available roles
    default: 'user', // Set a default role
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
