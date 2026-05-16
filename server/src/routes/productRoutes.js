const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const { getProducts, createProduct, updateProduct, deleteProduct, toggleAvailability } = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts); // PUBLIC
router.post('/', verifyToken, checkRole('admin'), createProduct);
router.put('/:id', verifyToken, checkRole('admin'), updateProduct);
router.delete('/:id', verifyToken, checkRole('admin'), deleteProduct);
router.patch('/:id/availability', verifyToken, checkRole('admin', 'cashier'), toggleAvailability);

module.exports = router;
