const express = require('express');
const router = express.Router();
const Item = require('../models/Itemsmodel'); // Replace with your item model

// GET request to retrieve all items from the database
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json({
      status: 'success',
      results: items.length,
      data: {
        data: items,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Route to add items
exports.additems = async (req, res) => {
  try {
    const itemData = req.body;
    if (Array.isArray(itemData) && itemData.length > 1) {
      // If the request body is an array with multiple elements, use insertMany
      const newItems = await Item.insertMany(itemData);
      res
        .status(201)
        .json({ message: 'Items added successfully', items: newItems });
    } else {
      // If the request body is an array with a single element or an object, use new Item
      const newItem = new Item(itemData);
      await newItem.save();
      res
        .status(201)
        .json({ message: 'Item added successfully', item: newItem });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Route to delete an item by ID
exports.deleteitem = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Check if the item exists
    const existingItem = await Item.findById(itemId);

    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Delete the item
    await existingItem.deleteOne({ _id: itemId });

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateitem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const updatedItemData = req.body;

    // Check if the item exists
    const existingItem = await Item.findById(itemId);

    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update the item
    await Item.findByIdAndUpdate(itemId, updatedItemData);

    // Fetch and return the updated item
    const updatedItem = await Item.findById(itemId);

    res
      .status(200)
      .json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
