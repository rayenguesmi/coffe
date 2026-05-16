const express = require('express');
const rateLimit = require('express-rate-limit');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const { createOrder, getOrders, getOrderById, updateStatus, getPublicOrder, getOrdersByTable } = require('../controllers/orderController');

const router = express.Router();

// Anti-spam: 10 orders per 15 min from same IP
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many orders from this IP. Try again in 15 minutes.' },
});

// Public
router.post('/', orderLimiter, createOrder);
router.get('/public/:orderId', getPublicOrder);

// Protected
router.get('/', verifyToken, checkRole('admin', 'cashier', 'waiter'), getOrders);
router.get('/table/:tableId', verifyToken, checkRole('admin', 'cashier', 'waiter'), getOrdersByTable);
router.get('/:id', verifyToken, checkRole('admin', 'cashier', 'waiter'), getOrderById);
router.patch('/:id/status', verifyToken, checkRole('admin', 'cashier', 'waiter'), updateStatus);

module.exports = router;
