require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const db = require('./database/db');
const { JWT_SECRET } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const walletRoutes = require('./routes/wallet');
const activationRoutes = require('./routes/activation');
const referralRoutes = require('./routes/referrals');
const profileRoutes = require('./routes/profile');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = (process.env.CORS_ORIGINS || (isProduction ? '' : [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].join(','))).split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || !isProduction) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 requests per window
  message: { success: false, message: 'Too many login/registration attempts. Please try again in 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests from this IP. Please slow down.' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', apiLimiter);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EarnFlow Core API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/activations', activationRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

if (isProduction) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist, { index: false }));
  app.get('*', (req, res, next) => {
    if (req.path === '/api' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: isProduction && status >= 500 ? 'Internal Server Error' : err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  if (isProduction) {
    if (!JWT_SECRET || JWT_SECRET.length < 32) {
      throw new Error('Set JWT_SECRET to a random value with at least 32 characters.');
    }
    if (!process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_live_') ||
        !process.env.PAYSTACK_PUBLIC_KEY?.startsWith('pk_live_')) {
      throw new Error('Production requires live Paystack keys in PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY.');
    }
    if (!fs.existsSync(path.join(__dirname, '../client/dist/index.html'))) {
      throw new Error('Production client build is missing. Run npm run build in the client directory.');
    }
  }

  await db.initialize();
  app.listen(PORT, () => {
    console.log(`EarnFlow server listening on port ${PORT} (${process.env.NODE_ENV || 'development'}).`);
  });
}

startServer().catch((err) => {
  console.error('[Startup Error]', err.message);
  process.exit(1);
});
