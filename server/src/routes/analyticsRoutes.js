const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const { getSummary } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/summary', verifyToken, checkRole('admin', 'cashier'), getSummary);

module.exports = router;
