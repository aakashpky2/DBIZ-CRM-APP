const express = require('express');
const router = express.Router();
const searchTaxpayerController = require('../controllers/searchTaxpayer');

router.get('/gstin/:gstin', searchTaxpayerController.searchByGSTIN);
router.get('/:gstin', searchTaxpayerController.searchByGSTIN); // keep old
router.get('/pan/:pan', searchTaxpayerController.searchByPAN);
router.post('/temp-id', searchTaxpayerController.searchByTempID);
router.post('/composition', searchTaxpayerController.searchComposition);

module.exports = router;
