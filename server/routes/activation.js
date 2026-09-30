const express = require('express');
const router = express.Router();
const activationController = require('../controllers/activationController');
const { authenticate } = require('../middleware/auth');

router.get('/status', authenticate, activationController.getActivationStatus);
router.post('/initialize', authenticate, activationController.initializeActivation);
router.post('/submit', authenticate, activationController.submitActivationPayment);

module.exports = router;
