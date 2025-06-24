const mongoose = require('mongoose');

const investmentPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  terms: { type: String },
  rate: { type: Number },
  durationDays: { type: Number },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('InvestmentPlan', investmentPlanSchema); 