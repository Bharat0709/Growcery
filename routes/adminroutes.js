
const express = require('express');
const authController = require('../controllers/authController');
const authenticateJWT = require('../middlewares/authenticateJWT');
const ItemsController = require('../controllers/ItemsController');
const CategoriesController = require('../controllers/CategoryController');
const Router = express.Router();

Router.post('/additem', ItemsController.additems);
Router.post('/category/addcategory', CategoriesController.addCategory);


Router.patch('/updateitem/:itemId', ItemsController.updateitem);

Router.patch(
  '/category/updatecategory/:categoryId',
  CategoriesController.updateCategory
);

Router.delete('/deleteitem/:itemId', ItemsController.deleteitem);

Router.delete(
  '/category/deletecategorywithitems/:categoryId',
  CategoriesController.deleteCategoryWithItems
);

module.exports = Router;
