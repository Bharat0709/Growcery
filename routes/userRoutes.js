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
  CartController.addToCart
);

Router.post(
  '/quantityincrease/:itemId',
  authenticateJWT.authenticateJWT,
  CartController.increaseQuantity
);
Router.post(
  '/quantitydecrease/:itemId',
  authenticateJWT.authenticateJWT,
  CartController.decreaseQuantity
);

Router.delete(
  '/deleteitem/:itemId',
  authenticateJWT.authenticateJWT,
  CartController.deleteItemFromCart
);
Router.delete(
  '/clearcart',
  authenticateJWT.authenticateJWT,
  CartController.clearCart
);

Router.get(
  '/getcartitems',
  authenticateJWT.authenticateJWT,
  CartController.getAllItemsInCart
);

// Router.get(
//   '/allorders',
//   authenticateJWT.authenticateJWT,
//   CartController.getAllOrders
// );

Router.post(
  '/order',
  authenticateJWT.authenticateJWT,
  CartController.placeOrder
);

Router.get('/allitems', ItemsController.getAllItems);
Router.get('/groupeditems/:name', ItemsController.groupedItems);
Router.get('/categories/allcategories', CategoriesController.getCategories);
Router.get('/filterItems', ItemsController.filterItems);

module.exports = Router;
