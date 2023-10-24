// Add a new category

const Category = require('../models/categorymodel');
const Item = require('../models/Itemsmodel');

exports.addCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const newCategory = new Category(categoryData);
    await newCategory.save();
    res
      .status(201)
      .json({ message: 'Category added successfully', category: newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update an existing category
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const categoryData = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      categoryData,
      { new: true }
    );
    res.status(200).json({
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ results: categories.length, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteCategoryWithItems = async (req, res) => {
  // Check if the user is an admin (You can add middleware to do this)
  // if (!req.user.isAdmin) {
  //   return res.status(403).json({ message: 'Access denied. Admin rights required.' });
  // }

  const categoryId = req.params.categoryId;

  try {
    // Find the category by ID
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete all items that belong to this category
    await Item.deleteMany({ category: categoryId });

    await Category.deleteOne({ _id: categoryId });

    return res
      .status(200)
      .json({ message: 'Category and items deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
