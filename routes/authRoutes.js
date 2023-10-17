const express = require('express');
const authController = require('../controllers/authController');
const authenticateJWT = require('../middlewares/authenticateJWT');
const Router = express.Router();

Router.post('/signup', authController.verifyOTP);
Router.post('/otp', authController.sendOTP);
Router.post('/logout', authenticateJWT.authenticateJWT, authController.logout);
// Router.post('/login', authController.login);

module.exports = Router;
