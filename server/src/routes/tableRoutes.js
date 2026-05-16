const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const { getTables, createTable, updateTable, deleteTable, getPublicTable } = require('../controllers/tableController');

const router = express.Router();

// Public — QR scan
router.get('/public/:tableNumber', getPublicTable);

// Protected
router.get('/', verifyToken, getTables);
router.post('/', verifyToken, checkRole('admin'), createTable);
router.put('/:id', verifyToken, checkRole('admin'), updateTable);
router.delete('/:id', verifyToken, checkRole('admin'), deleteTable);

module.exports = router;
