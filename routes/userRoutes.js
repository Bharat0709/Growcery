/* eslint-disable */

const express = require('express');
const authController = require('../controllers/authController');
const authenticateJWT = require('../middlewares/authenticateJWT');
const ItemsController = require('../controllers/groceries');
const CartController = require('../controllers/cart');
const Router = express.Router();

Router.get('/allitems', ItemsController.getAllItems);
Router.post('/additem', ItemsController.additems);
Router.post(
  '/addtocart/:itemId',
  authenticateJWT.authenticateJWT,
  CartController.addtocart
);
Router.post(
  '/quantity/:itemId',
  authenticateJWT.authenticateJWT,
  CartController.updateCartItemQuantity
);
Router.post(
  '/order',
  authenticateJWT.authenticateJWT,
  CartController.placeOrder
);
Router.delete('/deleteitem/:itemId', ItemsController.deleteitem);
Router.patch('/updateitem/:itemId', ItemsController.updateitem);

module.exports = Router;
