const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/send-verification-otp', authController.sendVerificationOtp);
router.post('/verify-signup-otp', authController.verifySignupOtp);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getProfile);
router.put('/change-password', authenticateToken, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOtp);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
