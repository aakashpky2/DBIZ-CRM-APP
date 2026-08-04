const express = require('express');
const router = express.Router();
const { searchGstp } = require('../controllers/gstp');

router.post('/search', searchGstp);

module.exports = router;
