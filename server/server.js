require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const { sequelize } = require('./src/models');
const initSocket = require('./src/socket');

const authRoutes = require('./src/routes/auth');
const tableRoutes = require('./src/routes/tableRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ── CORS origins ─────────────────────────────────────────────────────────────
// Accepts comma-separated list: CLIENT_ORIGIN=https://app.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
};

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
});
initSocket(io);
app.set('io', io);

// ── Middleware ────────────────────────────────────────────────────────────────
app.set('trust proxy', 1); // Required for rate-limit behind Railway/Vercel proxy
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'QuickCafe server is running.' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start server first so healthcheck passes, then connect DB ────────────────
server.listen(PORT, () => {
  console.log(`🚀 QuickCafe server running on port ${PORT}`);

  sequelize
    .authenticate()
    .then(() => {
      console.log('✅ Connected to MySQL');
      // En dev uniquement : sync({ alter: true }) pour créer les tables localement
      if (process.env.NODE_ENV !== 'production') {
        return sequelize.sync({ alter: true });
      }
    })
    .then(() => console.log('✅ Database ready'))
    .catch((err) => console.error('❌ Database error:', err.message));
});
