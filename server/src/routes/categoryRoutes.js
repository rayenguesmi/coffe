const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

const router = express.Router();

router.get('/', getCategories); // PUBLIC
router.post('/', verifyToken, checkRole('admin'), createCategory);
router.put('/:id', verifyToken, checkRole('admin'), updateCategory);
router.delete('/:id', verifyToken, checkRole('admin'), deleteCategory);

module.exports = router;
