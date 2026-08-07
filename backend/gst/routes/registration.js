const express = require('express');
const { registerStep1, verifyOtp, completeRegistration } = require('../controllers/registration');
const { getMasterUserTypes, getMasterStates, getMasterConstitutionTypes, getMasterReasonTypes, getMasterRegistrationTypes } = require('../controllers/master');
const { protect } = require('../../crm/middleware/auth');

const router = express.Router();

router.post('/step1', registerStep1);
router.post('/verify-otp', protect, verifyOtp);
router.post('/complete', completeRegistration);
router.get('/master-user-types', getMasterUserTypes);

router.get('/master-states', getMasterStates);
router.get('/master-constitution-types', getMasterConstitutionTypes);
router.get('/master-reason-types', getMasterReasonTypes);
router.get('/master-registration-types', getMasterRegistrationTypes);

module.exports = router;
