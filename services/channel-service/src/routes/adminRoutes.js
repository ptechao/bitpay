const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Return payment config (channels)
router.get('/payment-config', adminController.getPaymentConfig);
// Return cashier list (demo)
router.get('/cashier', adminController.getCashierList);

module.exports = router;
