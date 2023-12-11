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
  rating: {
    type: Number,
    min: 1,
    max: 5,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category schema
    required: [true, 'Please specify the category of the item'],
  },
  discountedPrice: {
    type: Number,
    default: 0, // You can set a default value if needed
  },
  quantity: {
    type: String,
    required: [true, 'Please specify the quantity of the item'], // You can set a default value if needed
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
