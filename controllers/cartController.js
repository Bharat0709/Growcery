const Order = require('../models/ordersmodel'); // Import the Order model
const twilio = require('twilio');
const client = twilio(process.env.TWILLIOUSERNAME, process.env.TWILLIOPASSWORD);
const Item = require('../models/Itemsmodel');
const user = require('../models/usermodel');
const Cart = require('../models/cartmodel');
const Address = require('../models/addressmodel');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

exports.addToCart = async (req, res) => {
  const user = req.userId;
  const itemId = req.params.itemId;
  const quantity = req.body.quantity || 1;

  try {
    const itemDetails = await Item.findById(itemId);

    if (!itemDetails) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const newPrice = itemDetails.discountedPrice * quantity;

    let cart = await Cart.findOne({ user });

    if (!cart) {
      cart = new Cart({
        user,
        items: [],
      });
    }

    const cartItemIndex = cart.items.findIndex(
      (item) => item.itemId.toString() === itemId
    );
    console.log(itemDetails);

    if (cartItemIndex !== -1) {
      return res.status(200).json({ message: 'Item is already in the cart' });
    } else {
      cart.items.push({ itemId, quantity, price: newPrice });
    }

    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
    cart.totalQuantity = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      message: 'Item added to cart',
      cart,
      totalPrice: cart.totalPrice,
      totalItems: cart.totalQuantity,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.increaseQuantity = async (req, res) => {
  const user = req.userId;
  const itemId = req.params.itemId;

  try {
    let cart = await Cart.findOne({ user });
    console.log(cart);

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartItem = cart.items.find(
      (item) => item.itemId.toString() === itemId
    );
    console.log('cartItem', cartItem);

    if (!cartItem) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    const IndividualPrice = cartItem.price / cartItem.quantity;
    cartItem.quantity++;
    cartItem.price = cartItem.quantity * IndividualPrice;

    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
    cart.totalQuantity = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      message: 'Quantity increased',
      cart,
      totalPrice: cart.totalPrice,
      totalItems: cart.totalQuantity,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.decreaseQuantity = async (req, res) => {
  const user = req.userId;
  const itemId = req.params.itemId;

  try {
    let cart = await Cart.findOne({ user });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartItem = cart.items.find(
      (item) => item.itemId.toString() === itemId
    );

    if (!cartItem) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    const IndividualPrice = cartItem.price / cartItem.quantity;
    if (cartItem.quantity > 1) {
      cartItem.quantity--;

      // Update the price based on the discounted price
      cartItem.price = cartItem.quantity * IndividualPrice;

      // Update cart's total price and total quantity
      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price,
        0
      );
      cart.totalQuantity = cart.items.reduce(
        (total, item) => total + item.quantity,
        0
      );

      await cart.save();

      res.status(200).json({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllItemsInCart = async (req, res) => {
  const user = req.userId;
  const cart = await Cart.findOne({ user: user }).populate(`items.itemId`);

  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  // Calculate total price and total items
  const totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
  const totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  res.status(200).json({ cart, totalPrice, totalItems });
};

exports.deleteItemFromCart = async (req, res) => {
  const user = req.userId;
  const itemId = req.params.itemId; // The ID of the item you want to remove

  try {
    const cart = await Cart.findOne({ user });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartItemIndex = cart.items.findIndex(
      (item) => item.itemId.toString() === itemId
    );

    if (cartItemIndex !== -1) {
      // Remove the item from the cart and store the deleted item
      const deletedItem = cart.items.splice(cartItemIndex, 1)[0];

      // Update the cart's total price and total quantity
      cart.totalPrice = cart.items.reduce(
        (total, item) => total + item.price,
        0
      );
      cart.totalQuantity = cart.items.reduce(
        (total, item) => total + item.quantity,
        0
      );

      await cart.save();

      res.status(200).json({
        message: 'Item removed from cart',
        deletedItem,
        cart,
        totalPrice: cart.totalPrice,
        totalItems: cart.totalQuantity,
      });
    } else {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const user = req.userId;
    const cart = await Cart.findOne({ user: user });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = [];
    cart.totalPrice = 0;
    cart.totalQuantity = 0;

    await cart.save();

    res.status(200).json({
      message: 'Cart cleared successfully',
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const user = req.userId;
    const { addressId } = req.body;

    // Retrieve user's cart with details
    const cart = await Cart.findOne({ user: user });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Retrieve user's selected address
    const address = await Address.findOne({ _id: addressId }); // Assuming you have a middleware to extract user ID from the request
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

// exports.getAllOrders = async (req, res) => {
//   try {
//     const userId = req.userId; // Assuming you have a middleware to extract user ID from the request

//     const orders = await Order.find({ user: userId }).populate([
//       {
//         path: 'cart.items.itemId',
//         model: Item,
//       },
//       {
//         path: 'address',
//         model: Address,
//       },
//     ]);

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ error: 'No orders found' });
//     }
//     console.log(orders);

//     // Process the orders and extract necessary details
//     const ordersDetails = orders.map((order) => ({
//       orderId: order._id,
//       address: order.address,
//       user: order.user,
//       items: order.items.map((item) => ({
//         itemId: item.itemId._id,
//         itemDetails: item.itemId,
//         quantity: item.quantity,
//       })),
//       cart: {
//         // totalPrice: order.cart.items.reduce(
//         //   (total, item) => total + item.price,
//         //   0
//         // ),
//         // totalQuantity: order.cart.items.reduce(
//         //   (total, item) => total + item.quantity,
//         //   0
//         // ),
//         items: order.cart.items.map((cartItem) => ({
//           itemId: cartItem.itemId._id,
//           itemDetails: cartItem.itemId,
//           quantity: cartItem.quantity,
//         })),
//       },
//     }));
//     res.status(200).json({
//       message: 'Successfully retrieved orders details',
//       orders: ordersDetails,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
