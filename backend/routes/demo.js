const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const DemoAccount = require('../models/DemoAccount');

// Helper: get or create demo account for user
async function getOrCreateDemoAccount(userId) {
  let account = await DemoAccount.findOne({ user: userId });
  if (!account) {
    // Initialize with $10,000 worth of each asset
    // Using approximate current prices for demo purposes
    const initialHoldings = [
      { asset: 'BTCUSDT', amount: 0.25 }, // ~$10,000 worth at ~$40,000 per BTC
      { asset: 'ETHUSDT', amount: 3.5 },  // ~$10,000 worth at ~$2,800 per ETH
      { asset: 'BNBUSDT', amount: 15 }    // ~$10,000 worth at ~$650 per BNB
    ];
    
    account = new DemoAccount({ 
      user: userId,
      balance: 10000, // $10,000 USD balance
      holdings: initialHoldings
    });
    await account.save();
  }
  return account;
}

// GET /api/demo/account - get demo account (balance, holdings, trades)
router.get('/account', auth, async (req, res) => {
  try {
    const account = await getOrCreateDemoAccount(req.user.userId);
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch demo account', error: err.message });
  }
});

// POST /api/demo/trade - place a buy/sell trade
router.post('/trade', auth, async (req, res) => {
  try {
    const { asset, type, amount, price } = req.body;
    if (!asset || !type || !amount || !price) return res.status(400).json({ message: 'Missing fields' });
    
    const account = await getOrCreateDemoAccount(req.user.userId);
    
    // Find existing holding or create new one
    let holdingIndex = account.holdings.findIndex(h => h.asset === asset);
    if (holdingIndex === -1) {
      account.holdings.push({ asset, amount: 0 });
      holdingIndex = account.holdings.length - 1;
    }
    
    let pnl = 0;
    if (type === 'Buy') {
      const cost = amount * price;
      if (cost > account.balance) return res.status(400).json({ message: 'Insufficient demo balance' });
      
      account.balance -= cost;
      account.holdings[holdingIndex].amount += amount;
      
    } else if (type === 'Sell') {
      if (amount > account.holdings[holdingIndex].amount) {
        return res.status(400).json({ message: 'Insufficient asset in demo account' });
      }
      
      const proceeds = amount * price;
      // Calculate P&L (simple: assume all bought at current price for demo)
      pnl = proceeds; // For real P&L, track buy price per lot
      
      account.balance += proceeds;
      account.holdings[holdingIndex].amount -= amount;
      
    } else {
      return res.status(400).json({ message: 'Invalid trade type' });
    }
    
    // Debug log
    console.log('DEBUG holdings before save:', JSON.stringify(account.holdings, null, 2));
    console.log('DEBUG holding amount for', asset, ':', account.holdings[holdingIndex].amount);
    
    // Directly set holdings to ensure Mongoose tracks the change
    account.set('holdings', account.holdings);
    
    // Add trade to history
    account.trades.unshift({ asset, type, amount, price, pnl });
    account.updatedAt = new Date();
    
    await account.save();
    res.json(account);
    
  } catch (err) {
    res.status(500).json({ message: 'Failed to place demo trade', error: err.message });
  }
});

// POST /api/demo/reset - reset demo account
router.post('/reset', auth, async (req, res) => {
  try {
    const account = await getOrCreateDemoAccount(req.user.userId);
    
    // Reset to $10,000 worth of each asset
    const initialHoldings = [
      { asset: 'BTCUSDT', amount: 0.25 }, // ~$10,000 worth at ~$40,000 per BTC
      { asset: 'ETHUSDT', amount: 3.5 },  // ~$10,000 worth at ~$2,800 per ETH
      { asset: 'BNBUSDT', amount: 15 }    // ~$10,000 worth at ~$650 per BNB
    ];
    
    account.balance = 10000;
    account.holdings = initialHoldings;
    account.trades = [];
    account.updatedAt = new Date();
    await account.save();
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset demo account', error: err.message });
  }
});

module.exports = router; 