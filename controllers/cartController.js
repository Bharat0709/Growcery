const Order = require('../models/ordersmodel'); // Import the Order model

const Item = require('../models/Itemsmodel');
const user = require('../models/usermodel');
const Cart = require('../models/cartmodel');

// Add item to cart
exports.addtocart = async (req, res) => {
  const user = req.userId;
  const itemId = req.params.itemId;
  const quantity = req.body.quantity || 1;
  const itemDetails = await Item.findById(itemId);
  console.log(user);
  console.log(itemDetails);

  if (!itemDetails) {
    return res.status(404).json({ error: 'Item not found' });
  }
  const newPrice = itemDetails.price * quantity;

  try {
    let cart = await Cart.findOne({ user: user });
    console.log(cart);

    if (!cart) {
      // If the user's cart doesn't exist, create a new cart
      cart = new Cart({
        user: user,
        items: [],
      });
    }

    const cartItemIndex = cart.items.findIndex(
      (item) => item.itemId.toString() === itemId
    );
    console.log(cartItemIndex);

    if (cartItemIndex !== -1) {
      return res.status(200).json({ message: 'Item is already in the cart' });
    } else {
      cart.items.push({ itemId, itemDetails, quantity, price: newPrice });
    }

    const totalPrice = cart.items.reduce(
      (total, item) => total + item.price,
      0
    );
    const totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    await cart.save();
    console.log(cart);

    res
      .status(200)
      .json({ message: 'Item added to cart', cart, totalPrice, totalItems });
  } catch (error) {
    res.status(500).json({ error });
    console.log(error);
  }
};

// Increase the quantity of an item in the cart
exports.increaseQuantity = async (req, res) => {
  const user = req.userId;
  const itemId = req.params.itemId;
  const cart = await Cart.findOne({ user: user });

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  const cartItemIndex = cart.items.findIndex(
    (item) => item.itemId.toString() === itemId
  );
  console.log(cartItemIndex);

  if (cartItemIndex !== -1) {
    // Increase the quantity by 1
    cart.items[cartItemIndex].quantity += 1;
    cart.items[cartItemIndex].price =
      cart.items[cartItemIndex].itemDetails.price *
      cart.items[cartItemIndex].quantity;
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
    cart.totalQuantity = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    await cart.save();

    return res.status(200).json({
      message: 'Quantity increased',
      cart,
      totalPrice: cart.totalPrice,
      totalItems: cart.totalQuantity,
    });
  } else {
    return res.status(404).json({ error: 'Item not found in cart' });
  }
};

// Decrease the quantity of an item in the cart
exports.decreaseQuantity = async (req, res) => {
  const user = req.userId;
  const itemId = req.params.itemId;
  const cart = await Cart.findOne({ user: user });

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const cartItemIndex = cart.items.findIndex(
    (item) => item.itemId.toString() === itemId
  );
  console.log(cartItemIndex);

  if (cartItemIndex !== -1) {
    // Decrease the quantity by 1, but make sure it doesn't go below 1
    if (cart.items[cartItemIndex].quantity > 1) {
      cart.items[cartItemIndex].quantity -= 1;
      cart.items[cartItemIndex].price =
        cart.items[cartItemIndex].itemDetails.price *
        cart.items[cartItemIndex].quantity;
      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price,
        0
      );
      cart.totalQuantity = cart.items.reduce(
        (total, item) => total + item.quantity,
        0
      );

      await cart.save();

      return res.status(200).json({
        message: 'Quantity decreased',
        cart,
        totalPrice: cart.totalPrice,
        totalItems: cart.totalQuantity,
      });
    } else {
      return res
        .status(400)
        .json({ error: 'Quantity cannot be decreased below 1' });
    }
  } else {
    return res.status(404).json({ error: 'Item not found in cart' });
  }
};

exports.getAllItemsInCart = async (req, res) => {
  const user = req.userId;
  const cart = await Cart.findOne({ user: user });

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  res.status(200).json({ cart });
};

exports.deleteItemFromCart = async (req, res) => {
  const user = req.userId;
  const itemId = req.params.itemId; // The ID of the item you want to remove
  const cart = await Cart.findOne({ user: user });

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const cartItemIndex = cart.items.findIndex(
    (item) => item.itemId.toString() === itemId
  );
  console.log(cartItemIndex);

  if (cartItemIndex !== -1) {
    // Remove the item from the cart
    const deletedItem = cart.items.splice(cartItemIndex, 1);

    // Update the cart's total price and total quantity
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
    cart.totalQuantity = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      message: 'Item removed from cart',
      cart,
      // deletedItem,
      totalPrice: cart.totalPrice,
      totalItems: cart.totalQuantity,
    });
  } else {
    return res.status(404).json({ error: 'Item not found in cart' });
  }
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
