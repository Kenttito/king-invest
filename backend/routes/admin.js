const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const { upload, handleUploadErrors } = require('../middlewares/upload');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  console.log('🔍 Admin route accessed by user:', req.user);
  console.log('🔍 User role:', req.user?.role);
  console.log('🔍 Admin impersonation flag:', req.user?.adminImpersonation);
  
  if (req.user && req.user.role === 'admin') {
    console.log('✅ Admin access granted');
    next();
  } else {
    console.log('❌ Admin access denied - user role:', req.user?.role);
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
  handleUploadErrors,
  adminController.updateCryptoAddresses
);

module.exports = router; 