const express = require('express');
const router = express.Router();
const gstr2bController = require('../controllers/gstr2b');

// IMPORTANT: Static routes MUST come before dynamic /:trn route

// Generate new snapshot (POST)
router.post('/generate', gstr2bController.generateGSTR2B);

// List all snapshots for a TRN
router.get('/snapshots/:trn', gstr2bController.getSnapshots);

// GET GSTR-2B Summary for Dashboard Cards
router.get('/summary/:trn', gstr2bController.getGSTR2BDashboardSummary);

// GET GSTR-2B data for a TRN (latest snapshot or filtered by month/year)
router.get('/:trn', gstr2bController.getGSTR2BData);

module.exports = router;
