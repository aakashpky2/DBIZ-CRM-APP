const express = require('express');
const router = express.Router();
const gstr2aController = require('../controllers/gstr2a');

// Summary and counts
router.get('/summary/:trn', gstr2aController.getGSTR2ASummary);

// Section-wise detail pages
router.get('/b2b/:trn', gstr2aController.getB2BInvoices);
router.get('/cdnr/:trn', gstr2aController.getCDNRNotes);
router.get('/amended/:trn', gstr2aController.getAmendedInvoices);

// ITC Summary
router.get('/itc/:trn', gstr2aController.getITCSummary);

module.exports = router;
