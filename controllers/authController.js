const User = require('../models/usermodel');
const NodeCache = require('node-cache');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const rateLimit = require('express-rate-limit');
const otpCache = new NodeCache();
const secretKey = 'your-secret-key';

const client = twilio(
  'ACa95f244bc0111e18ea45b12f335babb2',
  '3b2ef9874772dbe2dbf615c500dbbeff'
);

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
});

exports.sendOTP = (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ error: 'Invalid mobile number' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpCache.set(mobile, otp, 60 * 5);

  client.messages.create({
    body: `Your OTP for signup is: ${otp}`,
    to: `+${mobile}`,
    from: '+12566079867',
  });

  res.status(200).json({ message: 'OTP sent successfully', otp });
};

exports.verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    res.status(400).json({ error: 'Invalid mobile number or OTP' });
  }

  const cachedOTP = otpCache.get(mobile);
  if (!cachedOTP) {
    return res.status(400).json({ error: 'No OTP found. Request a new OTP.' });
  }

  if (cachedOTP && otp === cachedOTP) {
    const existingUser = await User.findOne({ mobile });

    if (!existingUser) {
      const user = new User({ mobile });
      await user.save();
    }
    otpCache.del(mobile);

    const token = jwt.sign({ id: existingUser }, secretKey, {
      expiresIn: '7d',
    });
    console.log(token);

    res
      .status(200)
      .json({ message: 'Registration completed successfully', token });
  }

  res.status(401).json({ message: 'Invalid OTP' });
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
