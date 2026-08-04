const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');


// @desc    Register user
// @route   POST /api/registration/step1
// @access  Public
exports.registerStep1 = async (req, res, next) => {
    try {
        const {
            userType,
            state,
            district,
            legalName,
            pan,
            email,
            mobile
        } = req.body;

        // Check if user already exists
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email);

        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Simulating TRN generation for step 2
        const trn = 'TRN' + Math.floor(10000000 + Math.random() * 90000000);

        // Simulate OTPs (6 digits)
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();

        console.log(`Email OTP for ${email}: ${emailOtp}`);
        console.log(`Mobile OTP for ${mobile}: ${mobileOtp}`);

        res.status(200).json({
            success: true,
            message: 'Details saved. Please verify OTPs sent to your email and mobile.',
            trn,
            debug: { emailOtp, mobileOtp } // For testing purposes
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/registration/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, emailOtp, mobileOtp, userType, state, district, legalName, pan, mobile } = req.body;
        console.log('Received for verification:', { email, emailOtp, mobileOtp, userType, pan });

        // In a real app, we would verify against stored OTPs
        // For simulation, we'll accept any 6 digits provided by the user
        if (emailOtp && mobileOtp && emailOtp.length === 6 && mobileOtp.length === 6) {
            const finalTrn = Math.floor(100000000000 + Math.random() * 900000000000) + 'TRN';

            // We assume req.user is set by auth middleware, if not we need it from the request body or token
            const userId = req.user ? req.user.id : (req.body.userId || '00000000-0000-0000-0000-000000000000');

            // Save the registration base data immediately to business_details and deduct 'reg_started' credit
            const { error: dbError } = await supabase
                .rpc('atomic_save_business_details_and_burn', {
                    p_user_id: userId,
                    p_trn: finalTrn,
                    p_payload: { email, mobile, legalName, pan, stateName: state, district },
                    p_action_key: 'reg_started'
                });

            if (dbError) {
                console.error("Failed to persist registration to business_details:", dbError.message);
                
                if (dbError.message && dbError.message.includes('INSUFFICIENT_CREDITS')) {
                    return res.status(402).json({ success: false, message: 'Insufficient credits to start a new Registration.' });
                }

                if (dbError.message && dbError.message.includes('Project paused')) {
                    console.warn("DB PAUSED: Simulating registration success for TRN:", finalTrn);
                    return res.status(200).json({
                        success: true,
                        message: 'OTP Verified (Simulated - Supabase Project Paused). Your TRN has been generated.',
                        trn: finalTrn,
                        isSimulated: true
                    });
                }
                
                return res.status(500).json({ success: false, message: 'Database Error: Could not save registration details. Is your Supabase project paused?' });
            }
            
            console.log("Registration Part A saved successfully for TRN:", finalTrn);

            // Attempt to insert into users table (optional, depending on DB rules)
            const { error: userError } = await supabase
                .from('users')
                .insert([{
                    email: email,
                    pan: pan || null,
                    username: finalTrn, // Uses TRN as a temp username for now
                    password: Math.random().toString(36).slice(-8)
                }]);
            
            if (userError) {
                console.error("Warning: Could not create user record:", userError.message);
                // We won't block the response for the users table since we care more about the TRN flow.
            }

            res.status(200).json({
                success: true,
                message: 'OTP Verified successfully. Your TRN has been generated and saved.',
                trn: finalTrn
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP. Please enter 6-digit OTPs.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Helper functions for GSTIN generation
const getStateCode = (stateName) => {
    if (!stateName) return '97'; // Other Territory
    const states = {
        'jammu & kashmir': '01', 'himachal pradesh': '02', 'punjab': '03', 'chandigarh': '04',
        'uttarakhand': '05', 'haryana': '06', 'delhi': '07', 'rajasthan': '08', 'uttar pradesh': '09',
        'bihar': '10', 'sikkim': '11', 'arunachal pradesh': '12', 'nagaland': '13', 'manipur': '14',
        'mizoram': '15', 'tripura': '16', 'meghalaya': '17', 'assam': '18', 'west bengal': '19',
        'jharkhand': '20', 'odisha': '21', 'chhattisgarh': '22', 'madhya pradesh': '23', 'gujarat': '24',
        'daman & diu': '25', 'dadra & nagar haveli': '26', 'maharashtra': '27', 'andhra pradesh (old)': '28',
        'karnataka': '29', 'goa': '30', 'lakshadweep': '31', 'kerala': '32', 'tamil nadu': '33',
        'puducherry': '34', 'andaman & nicobar islands': '35', 'telangana': '36', 'andhra pradesh': '37',
        'ladakh': '38'
    };
    const code = states[stateName.toLowerCase()];
    return code || '97';
};

const generateValidPan = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    let pan = '';
    // 5 letters
    for (let i = 0; i < 5; i++) pan += letters.charAt(Math.floor(Math.random() * letters.length));
    // 4 numbers
    for (let i = 0; i < 4; i++) pan += nums.charAt(Math.floor(Math.random() * nums.length));
    // 1 letter
    pan += letters.charAt(Math.floor(Math.random() * letters.length));
    return pan;
};

const generateGSTINChecksum = (gstin14) => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let hash = 0;
    for (let i = 0; i < gstin14.length; i++) {
        let val = chars.indexOf(gstin14[i]);
        let multiplier = (i % 2 === 0) ? 1 : 2;
        let product = val * multiplier;
        hash += Math.floor(product / 36) + (product % 36);
    }
    const remainder = hash % 36;
    const checksumVal = (36 - remainder) % 36;
    return chars[checksumVal];
};

const generateGSTIN = (stateName, existingPan) => {
    const stateCode = getStateCode(stateName);
    
    // Validate existing PAN format (AAAAA9999A) or generate new one
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    let pan = existingPan && panRegex.test(existingPan.toUpperCase()) 
        ? existingPan.toUpperCase() 
        : generateValidPan();
        
    const entityCode = '1';
    const fixedZ = 'Z';
    
    const gstin14 = stateCode + pan + entityCode + fixedZ;
    const checksum = generateGSTINChecksum(gstin14);
    
    return {
        gstin: gstin14 + checksum,
        stateCode,
        pan,
        entityCode,
        checksum
    };
};

// @desc    Complete registration and generate final credentials
// @route   POST /api/registration/complete
// @access  Public
exports.completeRegistration = async (req, res, next) => {
    try {
        const { trn, legalName, pan } = req.body;

        if (!trn) {
            return res.status(400).json({ success: false, message: 'TRN is required' });
        }

        console.log(`[RegistrationComplete] Attempting to complete registration for TRN: ${trn}`);

        // Fetch business details to associate with the user account
        const { data: bizData, error: bizError } = await supabase
            .from('business_details')
            .select('email, mobile, legal_name, pan, state_name, state')
            .eq('trn', trn)
            .single();

        if (bizError) {
            console.warn(`[RegistrationComplete] Warning: Could not fetch bizData for TRN ${trn}:`, bizError.message);
        }

        const userEmail = bizData?.email || `gst_user_${Math.floor(Math.random()*10000)}@example.com`;
        const userMobile = bizData?.mobile || '0000000000';
        const userState = bizData?.state_name || bizData?.state || 'Delhi'; // Fallback to Delhi
        const actualLegalName = legalName || bizData?.legal_name || 'GST Registrant';
        const initialPan = pan || bizData?.pan;

        console.log(`[RegistrationComplete] Derived Data - Email: ${userEmail}, Mobile: ${userMobile}, State: ${userState}, Name: ${actualLegalName}`);

        // 1. Generate GSTIN and its components
        const gstinData = generateGSTIN(userState, initialPan);

        // 2. Generate secure temporary username
        const tempUsername = `GST${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;

        // 3. Generate strong password (8-12 chars, upper, lower, number, special)
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const nums = "0123456789";
        const special = "@#$!%*?&";
        
        let tempPassword = "";
        tempPassword += upper[Math.floor(Math.random() * upper.length)];
        tempPassword += lower[Math.floor(Math.random() * lower.length)];
        tempPassword += nums[Math.floor(Math.random() * nums.length)];
        tempPassword += special[Math.floor(Math.random() * special.length)];
        
        const allChars = upper + lower + nums + special;
        const remainingLen = Math.floor(Math.random() * 5) + 4; // 4 to 8 more characters (total 8-12)
        for (let i = 0; i < remainingLen; i++) {
            tempPassword += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Shuffle the password
        tempPassword = tempPassword.split('').sort(() => 0.5 - Math.random()).join('');

        // Hash temporary password
        const tempPasswordHash = await bcrypt.hash(tempPassword, 10);

        const currentYear = new Date().getFullYear();
        const financialYear = `${currentYear}-${(currentYear + 1).toString().slice(2)}`;

        // Construct User Permissions (metadata)
        const permissions = {
            is_temporary_login: true,
            first_login_completed: false,
            pan: gstinData.pan, // Guaranteed valid PAN
            user_type: 'Taxpayer',
            state: userState,
            state_code: gstinData.stateCode,
            legal_name: actualLegalName,
            mobile: userMobile,
            trn: trn,
            gstin: gstinData.gstin,
            entity_code: gstinData.entityCode,
            checksum: gstinData.checksum,
            financial_year: financialYear,
            registration_date: new Date().toISOString()
        };

        // Insert/Update the user in the users table
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .upsert(
                {
                    username: tempUsername,
                    password_hash: tempPasswordHash,
                    email: userEmail,
                    role: 'student',
                    status: 'active',
                    permissions: permissions
                },
                { onConflict: 'username' }
            )
            .select();

        if (userError) {
            console.error("Failed to create final credentials:", userError);
            
            if ((userError.message && userError.message.includes('Project paused')) || userError.code === '42501' || (userError.message && userError.message.includes('row-level security'))) {
                console.warn("DB PAUSED OR RLS BLOCKED: Simulating credential creation success. Falling back to local_db.json");
                
                // Save to local fallback
                const fs = require('fs');
                const path = require('path');
                const LOCAL_DB_PATH = path.join(__dirname, '../local_db.json');
                try {
                    let localDb = {};
                    if (fs.existsSync(LOCAL_DB_PATH)) {
                        localDb = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8') || '{}');
                    }
                    if (!localDb['temp_users']) localDb['temp_users'] = [];
                    localDb['temp_users'].push({
                        username: tempUsername,
                        password_hash: tempPasswordHash,
                        email: userEmail,
                        role: 'student',
                        status: 'active',
                        permissions: permissions
                    });
                    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(localDb, null, 2), 'utf8');
                } catch (e) {
                    console.error("Failed to write user to local_db.json", e.message);
                }

                return res.status(200).json({
                    success: true,
                    message: 'Registration completed (Simulated - Supabase RLS is blocking inserts).',
                    credentials: {
                        username: tempUsername,
                        password: tempPassword,
                        gstin: gstinData.gstin
                    },
                    isSimulated: true
                });
            }
            
            return res.status(500).json({ 
                success: false, 
                message: 'Database Error: Could not create credentials. (RLS or permissions issue)',
                details: userError.message,
                hint: userError.hint
            });
        }

        // Delete the temporary TRN user so only the new credentials work
        await supabase
            .from('users')
            .delete()
            .eq('username', trn);

        res.status(200).json({
            success: true,
            message: 'Registration completed successfully.',
            credentials: {
                username: tempUsername,
                password: tempPassword,
                gstin: gstinData.gstin
            }
        });
    } catch (err) {
        console.error("Complete registration error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};
