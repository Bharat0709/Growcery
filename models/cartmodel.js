const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item', // Assuming there is an Item model
        required: true,
      },
      itemDetails: {
        type: {
          _id: mongoose.Schema.Types.ObjectId,
          name: String,
          description: String,
          price: Number,
          isVeg: Boolean,
          category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category', // Assuming there is a Category model
          },
          inStock: Boolean,
          image: String,
        },
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
