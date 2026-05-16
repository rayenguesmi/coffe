const express = require('express');
const { body } = require('express-validator');
const { login, logout, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email required.'),
    body('password').notEmpty().withMessage('Password required.'),
  ],
  login
);

router.post('/logout', logout);

router.get('/me', verifyToken, getMe);

router.post('/forgot-password',
  [body('email').isEmail().withMessage('Valid email required.')],
  forgotPassword
);

router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  resetPassword
);

module.exports = router;
