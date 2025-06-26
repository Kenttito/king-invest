const mongoose = require('mongoose');
const countryList = require('../data/countries');
const currencyList = require('../data/currencies');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  twoFASecret: { type: String },
  is2FAEnabled: { type: Boolean, default: false },
  country: { type: String, enum: countryList.map(c => c.code) },
  currency: { type: String, enum: currencyList.map(c => c.code) },
  phone: {
    type: String,
    minlength: 7,
    maxlength: 20,
    match: /^[0-9\-\+\s]+$/
  },
  firstName: { type: String, required: true, minlength: 2, maxlength: 30 },
  lastName: { type: String, required: true, minlength: 2, maxlength: 30 },
  emailConfirmationCode: { type: String },
  emailConfirmed: { type: Boolean, default: false },
  emailConfirmationExpires: { type: Date },
  isActive: { type: Boolean, default: false },
  registrationIP: { type: String },
  registrationDate: { type: Date, default: Date.now },
  lastLoginDate: { type: Date },
  // Password reset fields
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 