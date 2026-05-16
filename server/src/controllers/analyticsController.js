const { Op, fn, col, literal } = require('sequelize');
const { Order, OrderItem, Product, Table } = require('../models');

// GET /api/analytics/summary [auth: admin, cashier]
const getSummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [ordersToday, revenueResult, activeTables, topProducts, ordersByStatus] = await Promise.all([
      // Count of orders created today
      Order.count({ where: { createdAt: { [Op.gte]: todayStart } } }),

      // Revenue: sum of totals for delivered orders today
      Order.findOne({
        where: { status: 'delivered', createdAt: { [Op.gte]: todayStart } },
        attributes: [[fn('SUM', col('total')), 'total']],
        raw: true,
      }),

      // Active tables (orders with pending/preparing/ready status, distinct tableIds)
      Order.count({
        where: { status: { [Op.in]: ['pending', 'preparing', 'ready'] } },
        distinct: true,
        col: 'tableId',
      }),

      // Top 5 products by quantity ordered
      OrderItem.findAll({
        attributes: ['productId', [fn('SUM', col('quantity')), 'totalQty']],
        include: [{ model: Product, attributes: ['name', 'price'] }],
        group: ['productId', 'Product.id'],
        order: [[literal('totalQty'), 'DESC']],
        limit: 5,
        raw: false,
      }),

      // Orders grouped by status
      Order.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        ordersToday,
        revenueToday: parseFloat(revenueResult?.total || 0),
        activeTables,
        topProducts: topProducts.map((p) => ({
          productId: p.productId,
          name: p.Product?.name,
          totalQty: parseInt(p.getDataValue('totalQty')),
        })),
        ordersByStatus: ordersByStatus.reduce((acc, r) => {
          acc[r.status] = parseInt(r.count);
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    console.error('getSummary error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getSummary };
