const express = require('express');
const router = express.Router();
const { trackPaymentStatus, getLedgerBalance } = require('../controllers/payments');

router.post('/track-status', trackPaymentStatus);
router.get('/ledger-balance', getLedgerBalance);

module.exports = router;
