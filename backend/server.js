require('dotenv').config();

// Debug environment variables
console.log('🔍 Environment Variables Debug');
console.log('==============================');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ SET' : '❌ NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ NOT SET');
console.log('PORT:', process.env.PORT || '5001 (default)');
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

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5001;

// Health check endpoint - respond immediately
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint for basic connectivity test
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kings Invest API Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/investment-plans', investmentPlanRoutes);
app.use('/api/trader-signals', traderSignalsRouter);
app.use('/api/demo', demoRoutes);

const server = http.createServer(app);

// Start WebSocket for trader signals
startTraderSignalsWebSocket(server);
// Start WebSocket for live Binance trades
startBinanceTradesWebSocket(server);

// Start server immediately, then connect to database
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
  
  // Connect to database after server is running
  connectDB().then(() => {
    console.log('✅ Database connected successfully');
  }).catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    // Don't exit process, let server continue running
  });
});
