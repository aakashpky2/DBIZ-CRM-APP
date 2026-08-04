const express = require('express');
const router = express.Router();
const { superadminLogin } = require('../controllers/superadminController');

router.post('/login', superadminLogin);

module.exports = router;
