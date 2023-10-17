const User = require('../models/usermodel');
const NodeCache = require('node-cache');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const rateLimit = require('express-rate-limit');
const otpCache = new NodeCache();
const dotenv = require('dotenv');
const secretKey = 'your-secret-key';
dotenv.config({ path: './config.env' });

const client = twilio(process.env.TWILLIOUSERNAME, process.env.TWILLIOPASSWORD);

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
});

exports.sendOTP = (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile || !Number(mobile))
      return res.status(422).json({ error: 'Invalid phone number' });

    let otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpCache.set(mobile, otp, 60 * 5);

    client.messages.create({
      body: `Your OTP for signup is: ${otp}`,
      to: `+${mobile}`,
      from: '+12566079867',
    });

    res.status(200).json({ message: 'OTP sent successfully', otp });
  } catch (error) {
    // Handle any errors that occur during OTP generation and sending here
    console.error(error);
    res.status(500).json({ error: 'An error occurred while sending the OTP' });
  }
};


exports.verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;

  try {
    if (!mobile || !otp) {
      return res.status(400).json({ error: 'Invalid mobile number or OTP' });
    }

    const cachedOTP = otpCache.get(mobile);
    if (!cachedOTP) {
      return res
        .status(400)
        .json({ error: 'No OTP found. Request a new OTP.' });
    }

    if (cachedOTP && otp === cachedOTP) {
      const existingUser = await User.findOne({ mobile });
      if (!existingUser) {
        const user = new User({ mobile });
        console.log(user);
        await user.save();
      }

      otpCache.del(mobile);

      const token = jwt.sign({ id: existingUser }, secretKey, {
        expiresIn: '7d',
      });
      console.log(token);

      return res
        .status(200)
        .json({ message: 'Registration completed successfully', token });
    }

    return res.status(401).json({ message: 'Invalid OTP' });
  } catch (error) {
    // Handle any errors that occur during execution here
    console.error(error);
    res
      .status(500)
      .json({ error: 'An error occurred during OTP verification' });
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};
