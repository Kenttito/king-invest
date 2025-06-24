const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  asset: { type: String, required: true }, // e.g., BTCUSDT
  type: { type: String, enum: ['Buy', 'Sell'], required: true },
  amount: { type: Number, required: true }, // asset amount (e.g., BTC)
  price: { type: Number, required: true }, // price per unit (e.g., USD)
  time: { type: Date, default: Date.now },
  pnl: { type: Number }, // profit/loss for this trade
});

const HoldingsSchema = new mongoose.Schema({
  asset: { type: String, required: true }, // e.g., BTCUSDT
  amount: { type: Number, required: true, default: 0 },
});

const DemoAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 10000 }, // USD
  holdings: [HoldingsSchema],
  trades: [TradeSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DemoAccount', DemoAccountSchema); 