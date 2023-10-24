/* eslint-disable */

const express = require('express');
const authController = require('../controllers/authController');
const authenticateJWT = require('../middlewares/authenticateJWT');
const ItemsController = require('../controllers/ItemsController');
const CategoriesController = require('../controllers/CategoryController');
const CartController = require('../controllers/cartController');
const Router = express.Router();


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

Router.get('/allitems', ItemsController.getAllItems);
Router.get('/categories/allcategories', CategoriesController.getCategories);
Router.get('/filterItems', ItemsController.filterItems);


module.exports = Router;
