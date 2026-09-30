const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, walletController.getWallet);
router.get('/transactions', authenticate, walletController.getTransactions);
router.get('/withdrawals', authenticate, walletController.getWithdrawals);
router.post('/withdraw', authenticate, walletController.requestWithdrawal);

module.exports = router;
