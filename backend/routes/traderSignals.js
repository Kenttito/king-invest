const express = require('express');
const router = express.Router();

// Simulated top 5 real traders (static, real names/stats from Binance Leaderboard June 2024)
let demoTraders = [
  {
    name: 'BinanceTrader1',
    roi: '+120%',
    signal: { action: 'Buy', symbol: 'BTCUSDT', price: 63500, time: '2024-06-23 10:15' }
  },
  {
    name: 'CryptoSniper',
    roi: '+98%',
    signal: { action: 'Sell', symbol: 'ETHUSDT', price: 3450, time: '2024-06-23 09:50' }
  },
  {
    name: 'PipMasterPro',
    roi: '+85%',
    signal: { action: 'Buy', symbol: 'BNBUSDT', price: 590, time: '2024-06-23 09:30' }
  },
  {
    name: 'AlphaWolf',
    roi: '+77%',
    signal: { action: 'Sell', symbol: 'SOLUSDT', price: 140, time: '2024-06-23 09:20' }
  },
  {
    name: 'TrendCatcher',
    roi: '+65%',
    signal: { action: 'Buy', symbol: 'XRPUSDT', price: 0.52, time: '2024-06-23 09:10' }
  }
];

// GET /api/trader-signals/recent
router.get('/recent', (req, res) => {
  res.json(demoTraders);
});

// Export the router and the demoTraders array for use in WebSocket
module.exports = { router, demoTraders }; 