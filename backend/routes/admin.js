const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Apply auth middleware to all routes
router.use(auth);
router.use(requireAdmin);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/stats', adminController.getUserStats);

// Crypto address management routes
router.get('/crypto-addresses', adminController.getCryptoAddresses);
router.put('/crypto-addresses', 
  upload.fields([
    { name: 'BTC_QR', maxCount: 1 },
    { name: 'ETH_QR', maxCount: 1 },
    { name: 'USDT_QR', maxCount: 1 },
    { name: 'XRP_QR', maxCount: 1 }
  ]), 
  adminController.updateCryptoAddresses
);

module.exports = router; 