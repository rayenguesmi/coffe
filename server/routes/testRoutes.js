const express = require('express');
const router = express.Router();
const { startTest, getMyTests, getAllTests, getGlobalStats } = require('../controllers/testController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// User routes
router.post('/start', verifyToken, startTest);
router.get('/my-tests', verifyToken, getMyTests);

// Admin routes
router.get('/all', verifyToken, checkRole('admin'), getAllTests);
router.get('/stats', verifyToken, checkRole('admin'), getGlobalStats);

module.exports = router;
