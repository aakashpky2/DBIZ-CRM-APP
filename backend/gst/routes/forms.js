const express = require('express');
const { saveTab, getTab, resetForm, getGSTR1Summary, getTaxpayerProfile, getGSTR2BSummary } = require('../controllers/forms');

const router = express.Router();

router.post('/save-tab', saveTab);
router.get('/tab/:trn/:tabName', getTab);
router.get('/gstr1-summary/:trn', getGSTR1Summary);
router.get('/gstr2b-summary/:trn', getGSTR2BSummary);
router.get('/gstr1-profile/:trn', getTaxpayerProfile);
router.delete('/reset/:trn', resetForm);

module.exports = router;
