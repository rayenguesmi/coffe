const { Table, Order } = require('../models');
const { Op } = require('sequelize');

const generateQr = (tableNumber) => `table_${tableNumber}_${Date.now()}`;

// GET /api/tables [auth: cashier+]
const getTables = async (req, res) => {
  try {
    const tables = await Table.findAll({ order: [['tableNumber', 'ASC']] });
    return res.json({ success: true, data: tables });
  } catch (err) {
    console.error('getTables error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/tables [auth: admin]
const createTable = async (req, res) => {
  try {
    const last = await Table.findOne({ order: [['tableNumber', 'DESC']] });
    const tableNumber = last ? last.tableNumber + 1 : 1;
    const table = await Table.create({ tableNumber, qrCode: generateQr(tableNumber) });
    return res.status(201).json({ success: true, data: table });
  } catch (err) {
    console.error('createTable error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/tables/:id [auth: admin]
const updateTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found.' });

    const { isActive } = req.body;
    if (typeof isActive === 'boolean') table.isActive = isActive;
    await table.save();
    return res.json({ success: true, data: table });
  } catch (err) {
    console.error('updateTable error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/tables/:id [auth: admin]
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findByPk(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found.' });
    await table.destroy();
    return res.json({ success: true, message: 'Table deleted.' });
  } catch (err) {
    console.error('deleteTable error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/tables/public/:tableNumber (no auth — used by customer QR scan)
const getPublicTable = async (req, res) => {
  try {
    const table = await Table.findOne({
      where: { tableNumber: req.params.tableNumber, isActive: true },
    });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found or inactive.' });
    return res.json({ success: true, data: { id: table.id, tableNumber: table.tableNumber } });
  } catch (err) {
    console.error('getPublicTable error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getTables, createTable, updateTable, deleteTable, getPublicTable };
