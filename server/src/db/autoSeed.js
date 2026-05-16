const bcrypt = require('bcryptjs');

async function autoSeed(models) {
  const { User, Table, Category, Product, Order, OrderItem } = models;

  const userCount = await User.count();
  if (userCount > 0) return; // already seeded

  const adminPass = await bcrypt.hash('Admin123!', 12);
  const cashierPass = await bcrypt.hash('Cash123!', 12);
  const waiterPass = await bcrypt.hash('Wait123!', 12);

  await User.bulkCreate([
    { name: 'Admin',   email: 'admin@quickcafe.com',   password: adminPass,   role: 'admin',   isVerified: true },
    { name: 'Cashier', email: 'cashier@quickcafe.com', password: cashierPass, role: 'cashier', isVerified: true },
    { name: 'Waiter',  email: 'waiter@quickcafe.com',  password: waiterPass,  role: 'waiter',  isVerified: true },
  ]);

  const tablesData = Array.from({ length: 8 }, (_, i) => ({
    tableNumber: i + 1,
    qrCode: `table_${i + 1}_${Date.now() + i}`,
    isActive: true,
  }));
  const tables = await Table.bulkCreate(tablesData);

  const [coffee, drinks, desserts, snacks] = await Category.bulkCreate([
    { name: 'Coffee',   displayOrder: 1 },
    { name: 'Drinks',   displayOrder: 2 },
    { name: 'Desserts', displayOrder: 3 },
    { name: 'Snacks',   displayOrder: 4 },
  ]);

  const products = await Product.bulkCreate([
    { name: 'Espresso',         price: 1.80, available: true, categoryId: coffee.id,   image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400' },
    { name: 'Cappuccino',       price: 2.50, available: true, categoryId: coffee.id,   image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400' },
    { name: 'Latte',            price: 2.80, available: true, categoryId: coffee.id,   image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400' },
    { name: 'Americano',        price: 2.20, available: true, categoryId: coffee.id,   image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400' },
    { name: 'Orange Juice',     price: 3.00, available: true, categoryId: drinks.id,   image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },
    { name: 'Mint Lemonade',    price: 3.50, available: true, categoryId: drinks.id,   image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
    { name: 'Sparkling Water',  price: 1.50, available: true, categoryId: drinks.id,   image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400' },
    { name: 'Iced Tea',         price: 2.80, available: true, categoryId: drinks.id,   image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400' },
    { name: 'Chocolate Fondant',price: 4.50, available: true, categoryId: desserts.id, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400' },
    { name: 'Cheesecake',       price: 4.00, available: true, categoryId: desserts.id, image: 'https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=400' },
    { name: 'Tiramisu',         price: 4.20, available: true, categoryId: desserts.id, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' },
    { name: 'Crème Brûlée',     price: 3.80, available: true, categoryId: desserts.id, image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400' },
    { name: 'Club Sandwich',    price: 5.50, available: true, categoryId: snacks.id,   image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
    { name: 'Caesar Salad',     price: 5.00, available: true, categoryId: snacks.id,   image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400' },
    { name: 'Croissant',        price: 2.00, available: true, categoryId: snacks.id,   image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
    { name: 'Granola Bowl',     price: 4.50, available: true, categoryId: snacks.id,   image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400' },
  ]);

  const statuses = ['pending', 'preparing', 'ready', 'delivered', 'delivered'];
  for (let i = 0; i < 10; i++) {
    const table = tables[i % 8];
    const item1 = products[i % products.length];
    const item2 = products[(i + 3) % products.length];
    const qty1 = 1 + (i % 3);
    const total = parseFloat((item1.price * qty1 + item2.price).toFixed(2));
    const order = await Order.create({ tableId: table.id, status: statuses[i % 5], total });
    await OrderItem.bulkCreate([
      { orderId: order.id, productId: item1.id, quantity: qty1, unitPrice: item1.price },
      { orderId: order.id, productId: item2.id, quantity: 1,    unitPrice: item2.price },
    ]);
  }

  console.log('✅ Auto-seed complete — admin@quickcafe.com / Admin123!');
}

module.exports = autoSeed;
