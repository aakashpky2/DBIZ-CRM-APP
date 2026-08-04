const express = require('express');
const router = express.Router();
const { searchHolidays } = require('../controllers/holidays');

router.post('/search', searchHolidays);

module.exports = router;
