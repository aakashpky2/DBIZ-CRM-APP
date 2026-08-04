const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getStudentCredits,
  requestCredits,
  getStudentTransactions,
  burnCredits,
  getSuperadminCreditRequests,
  approveCreditRequest,
  rejectCreditRequest,
  getSuperadminTransactions,
  getCreditConfig,
  updateCreditConfig
} = require('../controllers/creditsController');

// ==========================================
// STUDENT CREDIT APIS
// ==========================================
router.get('/student/credits', protect, authorize('student'), getStudentCredits);
router.post('/student/credits/request', protect, authorize('student'), requestCredits);
router.get('/student/credits/transactions', protect, authorize('student'), getStudentTransactions);

// Credit burn API (called by students when using credit-based features)
router.post('/student/credits/burn', protect, authorize('student'), burnCredits);

// ==========================================
// SUPER ADMIN CREDIT APIS
// ==========================================
router.get('/superadmin/credit-requests', protect, authorize('superadmin'), getSuperadminCreditRequests);
router.post('/superadmin/credit-requests/:id/approve', protect, authorize('superadmin'), approveCreditRequest);
router.post('/superadmin/credit-requests/:id/reject', protect, authorize('superadmin'), rejectCreditRequest);
router.get('/superadmin/credit-transactions', protect, authorize('superadmin'), getSuperadminTransactions);
router.get('/superadmin/credit-config', protect, authorize('superadmin'), getCreditConfig);
router.put('/superadmin/credit-config/:key', protect, authorize('superadmin'), updateCreditConfig);

module.exports = router;
