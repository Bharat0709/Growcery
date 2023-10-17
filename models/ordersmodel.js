const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who placed the order
    required: true,
  },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item', // Reference to the item in the order
        required: true,
      },
      itemDetails: {
        type: Object, // You can define a sub-document schema for item details if needed
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

module.exports = mongoose.model('Order', orderSchema);
