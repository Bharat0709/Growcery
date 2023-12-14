const Order = require('../models/ordersmodel'); // Import the Order model
const twilio = require('twilio');
const client = twilio(process.env.TWILLIOUSERNAME, process.env.TWILLIOPASSWORD);
const Item = require('../models/Itemsmodel');
const user = require('../models/usermodel');
const Cart = require('../models/cartmodel');
const Address = require('../models/addressmodel');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

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

  const totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
  const totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  res.status(200).json({ cart, totalPrice, totalItems });
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
      deletedItem,
      totalPrice: cart.totalPrice,
      totalItems: cart.totalQuantity,
    });
  } else {
    return res.status(404).json({ error: 'Item not found in cart' });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const user = req.userId; // Assuming you have a middleware to extract user ID from the request

    // Retrieve user's cart with details
    const cart = await Cart.findOne({ user: user });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Retrieve user's selected address
    const addresses = await Address.find({ userId: user });
    const address = addresses.length > 0 ? addresses[0] : null;

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Calculate total quantity and total price
    const totalQuantity = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    // Retrieve detailed information for each item in the cart
    const itemsDetails = await Promise.all(
      cart.items.map(async (item) => {
        const itemDetails = await Item.findById(item.itemId);
        return {
          itemId: item.itemId,
          itemDetails: itemDetails.toObject(), // Convert to plain object for better serialization
          quantity: item.quantity,
        };
      })
    );
    const totalPrice = itemsDetails.reduce(
      (total, item) => total + item.quantity * item.itemDetails.price,
      0
    );
    console.log(totalPrice);

    const order = new Order({
      user: user,
      cart: cart._id,
      address: address._id,
      items: cart.items.map((item) => ({
        itemId: item.itemId._id,
        quantity: item.quantity,
      })),
    });

    // Save the order
    await order.save();

    client.messages.create({
      body: `*🛍 Order Confirmation*

📦 *Items Ordered*:

${itemsDetails
  .map(
    (item, index) =>
      `*${index + 1}. ${item.itemDetails.name} - ${item.quantity} x ₹${
        item.itemDetails.price
      } = ₹${item.quantity * item.itemDetails.price}*`
  )
  .join('\n\n')}

📊 Order Summary:
Total Items: *${totalQuantity}*
Total Price: *₹${itemsDetails.reduce(
        (total, item) => total + item.quantity * item.itemDetails.price,
        0
      )}*

📍 Delivery Address:
*Name: ${address.fullName}*
*Mobile Number: ${user.mobile}*
*Locality: ${address.locality}*
*Landmark: ${address.landmark}*,
*State: ${address.state}*
*Pincode: ${address.pincode}*
🚚 Your order is confirmed and will be delivered soon. Thank you for shopping with us! 🙏`,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${user.mobile}`,
    });

    res.status(200).json({
      message: 'Order created successfully',
      order: {
        orderId: order._id,
        itemsDetails,
        totalQuantity,
        totalPrice,
        address: address ? address.toObject() : null, // Convert to plain object for better serialization
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
