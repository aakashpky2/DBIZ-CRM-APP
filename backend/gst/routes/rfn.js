const express = require('express');
const router = express.Router();
const { verifyRfn } = require('../controllers/rfn');

router.post('/verify', verifyRfn);

module.exports = router;
