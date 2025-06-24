const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userController = require('../controllers/userController');
const role = require('../middlewares/role');

// Test route to debug middleware
router.get('/test', auth, (req, res) => {
  console.log('Test route called');
  console.log('User:', req.user);
  res.json({ message: 'Test route working', user: req.user });
});

// User profile routes - very specific
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

// Other user routes
router.get('/balance', auth, userController.getBalance);
router.get('/wallet', auth, userController.getWallet);
router.get('/activity', auth, userController.getActivity);
router.get('/crypto-addresses', auth, userController.getCryptoAddresses);

// Admin routes - put these after specific routes to avoid conflicts
router.get('/all', auth, role('admin'), userController.getAllUsers);
router.get('/withdrawals', auth, role('admin'), userController.getAllWithdrawals);

// Parameterized routes should come last
router.put('/:id', auth, role('admin'), userController.editUser);
router.delete('/:id', auth, role('admin'), userController.deleteUser);
router.put('/:id/role', auth, role('admin'), userController.assignRole);
router.get('/:id/withdrawals', auth, role('admin'), userController.getUserWithdrawals);

module.exports = router; 