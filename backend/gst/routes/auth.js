const express = require('express');
const { login, getMe, forgotPassword, changePassword, checkUsername, generateForgotOtp, verifyForgotOtp, resetPassword, getProfile } = require('../controllers/auth');

const router = express.Router();

// Middleware for protected routes
const { protect } = require('../middleware/auth');
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.post('/check-username', checkUsername);
router.post('/generate-forgot-otp', generateForgotOtp);
router.post('/verify-forgot-otp', verifyForgotOtp);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);
router.post('/profile', getProfile);
router.get('/me', protect, getMe);
router.get('/trn-details/:trn', async (req, res, next) => {
    try {
        const trn = req.params.trn;
        const supabase = require('../config/supabase'); // Local require to avoid circular deps if any
        const { data, error } = await supabase
            .from('business_details')
            .select('legal_name, pan, state_name, district')
            .eq('trn', trn)
            .single();

        if (error || !data) {
            return res.status(404).json({ success: false, message: 'TRN not found' });
        }

        // Check if registration is already completed for this TRN
        const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .eq('trn', trn)
            .single();

        if (existingUser) {
            return res.status(403).json({ 
                success: false, 
                message: 'This TRN is now disabled because the application has been submitted. Please login with your generated username and password.' 
            });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
