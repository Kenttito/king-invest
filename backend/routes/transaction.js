const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');
const transactionController = require('../controllers/transactionController');

router.post('/deposit', auth, transactionController.deposit);
router.post('/withdraw', auth, transactionController.withdraw);
router.post('/invest', auth, transactionController.invest);

// Admin deposit management
router.get('/deposits/pending', auth, role('admin'), transactionController.listPendingDeposits);
router.get('/deposits/all', auth, role('admin'), transactionController.listAllDeposits);
router.post('/deposits/:id/approve', auth, role('admin'), transactionController.approveDeposit);
router.post('/deposits/:id/decline', auth, role('admin'), transactionController.declineDeposit);
router.delete('/deposits/clear-all', auth, role('admin'), transactionController.clearAllDeposits);

router.post('/admin/deposit', auth, role('admin'), transactionController.adminDeposit);
router.post('/admin/deduct', auth, role('admin'), transactionController.adminDeduct);

// Admin withdrawal management
router.get('/withdrawals/pending', auth, role('admin'), transactionController.listPendingWithdrawals);
router.post('/withdrawals/:id/approve', auth, role('admin'), transactionController.approveWithdrawal);
router.post('/withdrawals/:id/decline', auth, role('admin'), transactionController.declineWithdrawal);

module.exports = router; 