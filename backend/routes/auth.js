const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/validate', authController.validateResetToken);
router.post('/reset-password', authController.resetPassword);

// 2FA routes
router.post('/2fa/setup', auth, authController.setup2FA);
router.post('/2fa/verify', auth, authController.verify2FA);
router.post('/2fa/validate', authController.validate2FA);

// Admin routes
router.post('/admin/login-as-user', auth, authController.adminLoginAsUser);

module.exports = router; 