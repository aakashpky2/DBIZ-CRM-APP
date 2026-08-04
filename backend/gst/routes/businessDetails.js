const express = require('express');
const { saveBusinessDetails } = require('../controllers/businessDetails');

const router = express.Router();

// POST /api/business-details/save
router.post('/save', saveBusinessDetails);

module.exports = router;
