const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  startVideoSession,
  updateVideoProgress,
  endVideoSession,
  getWatchHistory,
  getMonitoringSessions
} = require('../controllers/videoController');

// All endpoints require student authentication
router.post('/start', protect, authorize('student'), startVideoSession);
router.post('/progress', protect, authorize('student'), updateVideoProgress);
router.post('/end', protect, authorize('student'), endVideoSession);

// Alias to match the requested route in plan or keep it cleanly separated
router.get('/watch-history', protect, authorize('student'), getWatchHistory);

// Admin Monitoring Endpoint
router.get('/monitoring', protect, authorize('superadmin', 'institute', 'manager', 'admin'), getMonitoringSessions);

module.exports = router;
