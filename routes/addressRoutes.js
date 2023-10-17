const express = require('express');
const addressController = require('../controllers/addressController');
const JWtverify = require('../middlewares/authenticateJWT');
const Router = express.Router();

// Router.patch('/addresses/:id', addressController.updateAddress);
Router.post(
  '/addaddress',
  JWtverify.authenticateJWT,
  addressController.addaddress
);
Router.get(
  '/getaddress',
  JWtverify.authenticateJWT,
  addressController.getaddress
);

Router.patch(
  '/updateaddress/:addressId',
  JWtverify.authenticateJWT,
  addressController.updateaddress
);

Router.delete(
  '/deleteaddress/:addressId',
  JWtverify.authenticateJWT,
  addressController.deleteaddress
);

module.exports = Router;
