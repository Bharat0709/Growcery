const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who placed the order
    required: true,
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart', // Reference to the cart associated with the order
    required: true,
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address', // Reference to the user's address
    required: true,
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item', // Reference to the item in the order
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  // Add other order details like total price, shipping address, order date, etc.
});
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
