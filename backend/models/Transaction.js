const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
  type: { type: String, enum: ['deposit', 'withdrawal', 'trade', 'return', 'loss'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'declined', 'completed'], default: 'pending' },
  details: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema); 