const Order = require('../models/ordersmodel'); // Import the Order model
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Item = require('../models/Itemsmodel');
const user = require('../models/usermodel');
const Cart = require('../models/cartmodel');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 7 * 24 * 60 * 60 });

// Add item to cart
exports.addtocart = async (req, res) => {
  const user = req.userId;
  const itemId = req.params.itemId;
  const quantity = req.body.quantity;
  const itemDetails = await Item.findById(itemId); // Replace 'Item' with your actual item model

  if (!itemDetails) {
    return res.status(404).json({ error: 'Item not found' });
  }

  // Calculate the new price based on the updated quantity
  const newPrice = itemDetails.price * quantity;

  // Check if the user's cart exists in the cache
  const cart = cache.get(`cart:${user}`) || { items: [] };

  // Check if the item already exists in the cart
  const cartItemIndex = cart.items.findIndex((ci) => ci.itemId === itemId);
  console.log(cartItemIndex);
  if (cartItemIndex !== -1) {
    // If the item exists, update the quantity and price
    cart.items[cartItemIndex].quantity = quantity;
    cart.items[cartItemIndex].price = newPrice; // Add or update the price field
  } else {
    // If the item does not exist, add it to the cart with the new price
    cart.items.push({ itemId, itemDetails, quantity, price: newPrice });
  }

  // Calculate the total price and total number of items in the cart
  const totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
  const totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  cache.set(`cart:${user}`, cart);

  // Fetch the item's details from your database (e.g., MongoDB) using the itemId

  res
    .status(200)
    .json({ message: 'Item added to cart', cart, totalPrice, totalItems });
};

exports.updateCartItemQuantity = async (req, res) => {
  const user = req.userId;
  const itemId = req.params.itemId;
  const action = req.body.action; // 'increase' or 'decrease'

  const itemDetails = await Item.findById(itemId); // Replace 'Item' with your actual item model

  if (!itemDetails) {
    return res.status(404).json({ error: 'Item not found' });
  }

  // Calculate the new price based on the updated quantity

  // Check if the user's cart exists in the cache
  const cart = cache.get(`cart:${user}`) || { items: [] };

  // Find the item in the cart

  const cartItemIndex = cart.items.findIndex((ci) => ci.itemId === itemId);

  if (cartItemIndex === -1) {
    return res.status(404).json({ error: 'Item not found in cart' });
  }

  // Increase or decrease the quantity based on the action
  if (action === 'increase') {
    const newquantity = (cart.items[cartItemIndex].quantity += 1);
    const newPrice = itemDetails.price * newquantity;
    cart.items[cartItemIndex].price = newPrice;
  } else if (action === 'decrease') {
    if (cart.items[cartItemIndex].quantity > 1) {
      const newquantity = (cart.items[cartItemIndex].quantity -= 1);
      const newPrice = itemDetails.price * newquantity;
      cart.items[cartItemIndex].price = newPrice;
    }
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }
  const totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Calculate the total price after updating the quantity
  cache.set(`cart:${user}`, cart);

  const totalPrice = cart.items.reduce(
    (total, item) => total + item.quantity * item.itemDetails.price,
    0
  );

  res
    .status(200)
    .json({ message: 'Quantity updated', cart, totalPrice, totalItems });
};

exports.placeOrder = async (req, res) => {
  const user = req.userId; // Get user ID from JWT token

  // Get the user's cart from the cache
  const cart = cache.get(`cart:${user}`);

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Empty cart' });
  }

  // Calculate the total price and total quantity
  const totalPrice = cart.items.reduce(
    (total, item) => total + item.quantity * item.itemDetails.price,
    0
  );
  const totalQuantity = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Create an order object based on the Order schema
  const orderData = new Order({
    user,
    items: cart.items.map((cartItem) => ({
      itemId: cartItem.itemId,
      itemDetails: cartItem.itemDetails,
      quantity: cartItem.quantity,
    })),
    totalPrice, // Add the total price to the order
    totalQuantity, // Add the total quantity to the order
    // Add other order details like shipping address, etc.
  });

  // Save the order data to the database
  try {
    await orderData.save();
  } catch (error) {
    return res.status(500).json({ error: 'Error placing the order' });
  }

  // Clear the user's cart in the cache
  cache.del(`cart:${user}`);

  res.status(200).json({ message: 'Order placed successfully', orderData });
};
