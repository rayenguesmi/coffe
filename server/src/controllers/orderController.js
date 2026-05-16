const { Order, OrderItem, Product, Table } = require('../models');

// POST /api/orders (PUBLIC — customer without auth)
const createOrder = async (req, res) => {
  const { tableId, items, customerNote } = req.body;

  if (!tableId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'tableId and items[] are required.' });
  }

  try {
    const table = await Table.findByPk(tableId);
    if (!table || !table.isActive) {
      return res.status(404).json({ success: false, message: 'Table not found or inactive.' });
    }

    // Validate items and compute total
    let total = 0;
    const resolvedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ success: false, message: 'Each item needs productId and quantity >= 1.' });
      }
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found.` });
      }
      if (!product.available) {
        return res.status(400).json({ success: false, message: `Product "${product.name}" is currently unavailable.` });
      }
      total += parseFloat(product.price) * item.quantity;
      resolvedItems.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price });
    }

    const order = await Order.create({
      tableId,
      status: 'pending',
      total: parseFloat(total.toFixed(2)),
      customerNote: customerNote || null,
    });

    await OrderItem.bulkCreate(resolvedItems.map((i) => ({ ...i, orderId: order.id })));

    // Fetch full order with items to emit via socket
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: Table, attributes: ['tableNumber'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['name', 'price'] }] },
      ],
    });

    // Emit socket event if io is available (attached in server.js)
    const io = req.app.get('io');
    if (io) {
      io.to('dashboard').emit('new_order', { order: fullOrder, table, items: fullOrder.OrderItems });
    }

    return res.status(201).json({ success: true, data: fullOrder });
  } catch (err) {
    console.error('createOrder error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders [auth: cashier+]
const getOrders = async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const orders = await Order.findAll({
      where,
      include: [
        { model: Table, attributes: ['tableNumber'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['name', 'price'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error('getOrders error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/:id [auth: cashier+]
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: Table, attributes: ['tableNumber'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['name', 'price', 'image'] }] },
      ],
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    return res.json({ success: true, data: order });
  } catch (err) {
    console.error('getOrderById error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/orders/:id/status [auth: cashier+]
const updateStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
  }

  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: Table, attributes: ['tableNumber'] }],
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.status = status;
    await order.save();

    const io = req.app.get('io');
    if (io) {
      io.to('dashboard').emit('order_updated', { orderId: order.id, status, tableNumber: order.Table?.tableNumber });
      io.to(`table_${order.tableId}`).emit('order_updated', { orderId: order.id, status });
    }

    return res.json({ success: true, data: { id: order.id, status: order.status } });
  } catch (err) {
    console.error('updateStatus error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/public/:orderId (PUBLIC — customer tracking)
const getPublicOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      attributes: ['id', 'status', 'total', 'createdAt'],
      include: [
        { model: Table, attributes: ['tableNumber'] },
        { model: OrderItem, include: [{ model: Product, attributes: ['name', 'price'] }] },
      ],
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    return res.json({ success: true, data: order });
  } catch (err) {
    console.error('getPublicOrder error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/orders/table/:tableId [auth: cashier+]
const getOrdersByTable = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { tableId: req.params.tableId },
      include: [{ model: OrderItem, include: [{ model: Product, attributes: ['name'] }] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error('getOrdersByTable error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateStatus, getPublicOrder, getOrdersByTable };
