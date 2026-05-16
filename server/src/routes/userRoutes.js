const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const { getAllUsers, createUser, updateRole, toggleActive, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.get('/', verifyToken, checkRole('admin'), getAllUsers);
router.post('/', verifyToken, checkRole('admin'), createUser);
router.patch('/:id/role', verifyToken, checkRole('admin'), updateRole);
router.patch('/:id/toggle', verifyToken, checkRole('admin'), toggleActive);
router.delete('/:id', verifyToken, checkRole('admin'), deleteUser);

module.exports = router;
