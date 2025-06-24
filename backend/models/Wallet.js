const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['crypto', 'fiat'], required: true },
  currency: { type: String, required: true },
  balance: { type: Number, default: 0 },
  invested: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema); 