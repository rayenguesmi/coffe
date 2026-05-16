require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Table, Category, Product, Order, OrderItem } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    await sequelize.sync({ force: true });
    console.log('✅ Tables created');

    // ── Users ──────────────────────────────────────────────────────────────
    const adminPass = await bcrypt.hash('Admin123!', 12);
    const cashierPass = await bcrypt.hash('Cash123!', 12);
    const waiterPass = await bcrypt.hash('Wait123!', 12);

    const [admin, cashier, waiter] = await User.bulkCreate([
      { name: 'Admin', email: 'admin@quickcafe.com', password: adminPass, role: 'admin', isVerified: true },
      { name: 'Cashier', email: 'cashier@quickcafe.com', password: cashierPass, role: 'cashier', isVerified: true },
      { name: 'Waiter', email: 'waiter@quickcafe.com', password: waiterPass, role: 'waiter', isVerified: true },
    ]);
    console.log('✅ Users seeded');

    // ── Tables ─────────────────────────────────────────────────────────────
    const tablesData = Array.from({ length: 8 }, (_, i) => ({
      tableNumber: i + 1,
      qrCode: `table_${i + 1}_${Date.now() + i}`,
      isActive: true,
    }));
    const tables = await Table.bulkCreate(tablesData);
    console.log('✅ Tables seeded');

    // ── Categories ─────────────────────────────────────────────────────────
    const [coffee, drinks, desserts, snacks] = await Category.bulkCreate([
      { name: 'Coffee', displayOrder: 1 },
      { name: 'Drinks', displayOrder: 2 },
      { name: 'Desserts', displayOrder: 3 },
      { name: 'Snacks', displayOrder: 4 },
    ]);
    console.log('✅ Categories seeded');

    // ── Products ────────────────────────────────────────────────────────────
    const products = await Product.bulkCreate([
      { name: 'Espresso', description: 'Strong and bold single shot', price: 1.80, image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400', available: true, categoryId: coffee.id },
      { name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 2.50, image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400', available: true, categoryId: coffee.id },
      { name: 'Latte', description: 'Smooth espresso with lots of steamed milk', price: 2.80, image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400', available: true, categoryId: coffee.id },
      { name: 'Americano', description: 'Espresso diluted with hot water', price: 2.20, image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400', available: true, categoryId: coffee.id },
      { name: 'Orange Juice', description: 'Freshly squeezed orange juice', price: 3.00, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', available: true, categoryId: drinks.id },
      { name: 'Mint Lemonade', description: 'Refreshing lemon juice with fresh mint', price: 3.50, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', available: true, categoryId: drinks.id },
      { name: 'Sparkling Water', description: 'Natural sparkling mineral water', price: 1.50, image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400', available: true, categoryId: drinks.id },
      { name: 'Iced Tea', description: 'Cold brewed tea with lemon', price: 2.80, image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400', available: true, categoryId: drinks.id },
      { name: 'Chocolate Fondant', description: 'Warm chocolate cake with molten center', price: 4.50, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', available: true, categoryId: desserts.id },
      { name: 'Cheesecake', description: 'Classic New York style cheesecake', price: 4.00, image: 'https://images.unsplash.com/photo-1567171466295-4afa63d45416?w=400', available: true, categoryId: desserts.id },
      { name: 'Tiramisu', description: 'Italian classic with mascarpone and coffee', price: 4.20, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', available: true, categoryId: desserts.id },
      { name: 'Crème Brûlée', description: 'French custard with caramelized sugar top', price: 3.80, image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400', available: true, categoryId: desserts.id },
      { name: 'Club Sandwich', description: 'Triple decker with chicken, bacon, tomato', price: 5.50, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', available: true, categoryId: snacks.id },
      { name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, caesar dressing', price: 5.00, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400', available: true, categoryId: snacks.id },
      { name: 'Croissant', description: 'Buttery flaky French pastry', price: 2.00, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', available: true, categoryId: snacks.id },
      { name: 'Granola Bowl', description: 'Greek yogurt, granola, fresh berries, honey', price: 4.50, image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400', available: true, categoryId: snacks.id },
    ]);
    console.log('✅ Products seeded');

    // ── Orders (10) ─────────────────────────────────────────────────────────
    const statuses = ['pending', 'preparing', 'ready', 'delivered', 'delivered'];
    for (let i = 0; i < 10; i++) {
      const table = tables[i % 8];
      const status = statuses[i % statuses.length];
      const item1 = products[i % products.length];
      const item2 = products[(i + 3) % products.length];
      const qty1 = 1 + (i % 3);
      const qty2 = 1;
      const total = parseFloat((item1.price * qty1 + item2.price * qty2).toFixed(2));

      const order = await Order.create({
        tableId: table.id,
        status,
        total,
        customerNote: i % 3 === 0 ? 'No sugar please' : null,
      });

      await OrderItem.bulkCreate([
        { orderId: order.id, productId: item1.id, quantity: qty1, unitPrice: item1.price },
        { orderId: order.id, productId: item2.id, quantity: qty2, unitPrice: item2.price },
      ]);
    }
    console.log('✅ Orders seeded');

    console.log('\n🎉 Database seeded successfully!');
    console.log('   admin@quickcafe.com   / Admin123!');
    console.log('   cashier@quickcafe.com / Cash123!');
    console.log('   waiter@quickcafe.com  / Wait123!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
