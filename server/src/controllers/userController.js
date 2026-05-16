const bcrypt = require('bcryptjs');
const { User } = require('../models');

// GET /api/users — list all employees [admin]
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('getAllUsers error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/users — create employee [admin]
const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'name, email, password and role are required.' });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, role, isVerified: true });

    return res.status(201).json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
    });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/users/:id/role — change role [admin]
const updateRole = async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'cashier', 'waiter'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role.' });
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.role = role;
    await user.save();
    return res.json({ success: true, data: { id: user.id, role: user.role } });
  } catch (err) {
    console.error('updateRole error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/users/:id/toggle — toggle isVerified [admin]
const toggleActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isVerified = !user.isVerified;
    await user.save();
    return res.json({ success: true, data: { id: user.id, isVerified: user.isVerified } });
  } catch (err) {
    console.error('toggleActive error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/users/:id [admin]
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete yourself.' });

    await user.destroy();
    return res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllUsers, createUser, updateRole, toggleActive, deleteUser };
