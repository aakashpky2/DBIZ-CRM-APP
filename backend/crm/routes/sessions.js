const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, sessionController.startSession);
router.post('/pulse', protect, sessionController.sessionPulse);
router.post('/premium-action', protect, sessionController.premiumAction);

module.exports = router;
