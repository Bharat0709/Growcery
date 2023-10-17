const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter the name of the item'],
  },
  description: {
    type: String,
    required: [true, 'Please enter the description of the item'],
  },
  price: {
    type: Number,
    required: [true, 'Please enter the price of the item'],
  },
  isVeg: {
    type: Boolean,
    required: [true, 'Please specify if the item is vegetarian or not'],
  },
  category: {
    type: String,
    required: [true, 'Please enter the category of the item'],
  },
  inStock: {
    type: Boolean,
    required: [true, 'Please specify if the item is in stock or not'],
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL for the item'],
  },
});

module.exports = mongoose.model('GroceryItem', groceryItemSchema);

