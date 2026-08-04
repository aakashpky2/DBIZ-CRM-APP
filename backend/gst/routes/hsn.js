const express = require('express');
const router = express.Router();
const { searchHsn, downloadHsnExcel } = require('../controllers/hsn');

router.post('/search', searchHsn);
router.get('/download', downloadHsnExcel);

module.exports = router;
