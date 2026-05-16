const { Category } = require('../models');

// GET /api/categories (PUBLIC)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['displayOrder', 'ASC'], ['name', 'ASC']] });
    return res.json({ success: true, data: categories });
  } catch (err) {
    console.error('getCategories error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/categories [admin]
const createCategory = async (req, res) => {
  const { name, displayOrder } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'name is required.' });
  try {
    const cat = await Category.create({ name, displayOrder: displayOrder || 0 });
    return res.status(201).json({ success: true, data: cat });
  } catch (err) {
    console.error('createCategory error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/categories/:id [admin]
const updateCategory = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    const { name, displayOrder } = req.body;
    if (name) cat.name = name;
    if (displayOrder !== undefined) cat.displayOrder = displayOrder;
    await cat.save();
    return res.json({ success: true, data: cat });
  } catch (err) {
    console.error('updateCategory error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/categories/:id [admin]
const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
    await cat.destroy();
    return res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
