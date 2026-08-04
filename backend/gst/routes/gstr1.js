const express = require('express');
const { getRecords, saveRecord, deleteRecord, getCounts, resetRecords } = require('../controllers/gstr1');

const router = express.Router();

router.get('/counts/:trn', getCounts);
router.get('/records/:tableName/:trn', getRecords);
router.post('/records/:tableName', saveRecord);
router.delete('/records/:tableName/:id', deleteRecord);
router.delete('/reset/:trn', resetRecords);

module.exports = router;
