const express = require('express');
const router = express.Router();
const { searchCauseList, downloadCauseListExcel } = require('../controllers/causeList');

router.post('/search', searchCauseList);
router.get('/download-excel', downloadCauseListExcel);

module.exports = router;
