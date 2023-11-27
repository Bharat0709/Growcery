const Address = require('../models/addressmodel'); // Import the Address model // Import your JWT authentication middleware

exports.addaddress = async (req, res) => {
  const userId = req.userId; // Get the user ID from the JWT payload
  const {
    fullName,
    phone,
    pincode,
    locality,
    city,
    state,
    landmark,
    alternativePhone,
    addressType,
  } = req.body;

  try {
    // Create a new address using the Address model
    const newAddress = new Address({
      userId,
      fullName,
      phone,
      pincode,
      locality,
      city,
      state,
      landmark,
      alternativePhone,
      addressType,
    });

    // Save the new address to the database
    await newAddress.save();

    res
      .status(201)
      .json({ message: 'Address added successfully', address: newAddress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add address' });
  }
};

exports.getaddress = async (req, res) => {
  try {
    // Get the user ID from the JWT token
    const userId = req.userId;
    const user = userId._id;

    // Find all addresses associated with the user's ID
    const addresses = await Address.find({ userId });

    res.status(200).json({ user, addresses });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving addresses' });
  }
};

exports.updateaddress = async (req, res) => {
  const userId = req.userId; // Get the user ID from JWT token
  const addressId = req.params.addressId;
  const updatedData = req.body;

  try {
    // Ensure that the address belongs to the user (by matching the userId)
    const address = await Address.findOneAndUpdate(
      { _id: addressId, userId: userId },
      updatedData,
      { new: true } // To get the updated address as the result
    );

    if (!address) {
      return res.status(404).json({
        error: 'Address not found or you do not have permission to update it.',
      });
    }

    res.status(200).json({ message: 'Address updated successfully', address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an address for a specific user
exports.deleteaddress = async (req, res) => {
  const userId = req.userId;
  const addressId = req.params.addressId;

  try {
    const address = await Address.findOneAndRemove({
      _id: addressId,
      userId: userId,
    });

    if (!address) {
      res.status(404).json({
        error: 'Address not found or you do not have permission to delete it.',
      });
    }

    res.status(204).end(); // 204 No Content - Address deleted successfully
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
