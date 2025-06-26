console.log('🚀 server.js is running');

require('dotenv').config();

// Debug environment variables
console.log('🔍 Environment Variables Debug');
console.log('==============================');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');
console.log('PORT:', process.env.PORT || '8080 (default)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

if (process.env.MONGODB_URI) {
  console.log('\n📋 MONGODB_URI preview (first 50 chars):', process.env.MONGODB_URI.substring(0, 50) + '...');
} else {
  console.log('\n❌ MONGODB_URI is missing!');
  console.log('💡 Make sure to add MONGODB_URI to Railway environment variables');
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const transactionRoutes = require('./routes/transaction');
const userRoutes = require('./routes/user');
const investmentPlanRoutes = require('./routes/investmentPlan');
const http = require('http');
const { router: traderSignalsRouter } = require('./routes/traderSignals');
const startTraderSignalsWebSocket = require('./websocket/traderSignalsSocket');
const startBinanceTradesWebSocket = require('./websocket/binanceTradesSocket');
const demoRoutes = require('./routes/demo');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => res.send('OK'));
app.get('/api/health', (req, res) => res.send('OK'));

// Add all routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/investment-plans', investmentPlanRoutes);
app.use('/api/trader-signals', traderSignalsRouter);
app.use('/api/demo', demoRoutes);

// Create server
const server = http.createServer(app);

// Start server first, then handle database and WebSocket connections
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Full backend server running on', PORT);
  
  // Connect to database after server is running
  if (process.env.MONGODB_URI) {
    connectDB().then(() => {
      console.log('✅ Database connected successfully');
    }).catch((err) => {
      console.error('❌ Database connection failed:', err.message);
      // Don't exit process, let server continue running
    });
  } else {
    console.log('⚠️ MONGODB_URI not set, skipping database connection');
  }
  
  // Start WebSocket connections
  try {
startTraderSignalsWebSocket(server);
startBinanceTradesWebSocket(server);
    console.log('✅ WebSocket connections started');
  } catch (error) {
    console.error('❌ WebSocket connection failed:', error.message);
    // Don't exit process, let server continue running
  }
});

// Handle server errors gracefully
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.log('💡 Port is already in use. Trying to use Railway PORT environment variable.');
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
