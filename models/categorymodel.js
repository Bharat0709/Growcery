const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter the name of the category'],
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL for the category'],
  },
});

module.exports = mongoose.model('Category', categorySchema);
