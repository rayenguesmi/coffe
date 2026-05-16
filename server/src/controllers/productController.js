const { Product, Category } = require('../models');

// GET /api/products?categoryId= (PUBLIC)
const getProducts = async (req, res) => {
  try {
    const where = {};
    if (req.query.categoryId) where.categoryId = req.query.categoryId;

    const products = await Product.findAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });
    return res.json({ success: true, data: products });
  } catch (err) {
    console.error('getProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/products [admin]
const createProduct = async (req, res) => {
  const { name, description, price, image, available, categoryId } = req.body;
  if (!name || !price || !categoryId) {
    return res.status(400).json({ success: false, message: 'name, price, and categoryId are required.' });
  }
  try {
    const cat = await Category.findByPk(categoryId);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });

    const product = await Product.create({ name, description, price, image, available, categoryId });
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/products/:id [admin]
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const { name, description, price, image, available, categoryId } = req.body;
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (image !== undefined) product.image = image;
    if (available !== undefined) product.available = available;
    if (categoryId !== undefined) product.categoryId = categoryId;

    await product.save();
    return res.json({ success: true, data: product });
  } catch (err) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/products/:id [admin]
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    await product.destroy();
    return res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    console.error('deleteProduct error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/products/:id/availability [admin, cashier]
const toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    product.available = !product.available;
    await product.save();
    return res.json({ success: true, data: { id: product.id, available: product.available } });
  } catch (err) {
    console.error('toggleAvailability error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct, toggleAvailability };
