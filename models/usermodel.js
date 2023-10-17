const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [false, 'Please enter your Name'],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
  },
  mobile: {
    type: String,
    required: [true, 'Please enter your Mobile Number'],
    unique: true,
    trim: true,
  },
  otp: {
    type: String,
    required: [false, 'Please enter the OTP'],
  },
  addresses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
  ],
  role: {
    type: String,
    enum: ['user', 'admin'], // Define the available roles
    default: 'user', // Set a default role
  },
});

// Hash the password before saving it to the database
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(this.password, salt);
//     this.password = hashedPassword;
//     next();
//   } catch (error) {
//     return next(error);
//   }
// });

const User = mongoose.model('User', userSchema);

module.exports = User;
