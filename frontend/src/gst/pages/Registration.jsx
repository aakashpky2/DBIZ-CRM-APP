import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';

const Registration = () => {
    const navigate = useNavigate();
    const [regType, setRegType] = useState('New Registration');
    const [userType, setUserType] = useState('Taxpayer');
    const [userTypes, setUserTypes] = useState(['Taxpayer']); // Default
    const [states, setStates] = useState(['Andaman and Nicobar Islands']); // Default
    const [step, setStep] = useState(1); // 1: User Credentials, 2: OTP Verification

    const [formData, setFormData] = useState({
        state: 'Andaman and Nicobar Islands',
        district: '',
        legalName: '',
        pan: '',
        email: '',
        mobile: '',
        trn: ''
    });

    const [otpData, setOtpData] = useState({
        mobileOtp: '',
        emailOtp: ''
    });

    const [loading, setLoading] = useState(false);
    const [generatedOtps, setGeneratedOtps] = useState({ emailOtp: '', mobileOtp: '' });

    const [secondRadio, setSecondRadio] = useState('PAN');
    const [hasRepresentative, setHasRepresentative] = useState(false);

    // Fetch master data on load
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [typesRes, statesRes] = await Promise.all([
                    api.get('/registration/master-user-types'),
                    api.get('/registration/master-states')
                ]);

                if (typesRes.data.success) setUserTypes(typesRes.data.data);
                if (statesRes.data.success) {
                    setStates(statesRes.data.data);
                    // Update default if first state exists
                    if (statesRes.data.data.length > 0) {
                        setFormData(prev => ({ ...prev, state: statesRes.data.data[0] }));
                    }
                }
            } catch (err) {
                console.error('Error fetching master data:', err);
                toast.error('Failed to load dropdown data from server.');
            }
        };
        fetchMasterData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validation for legalName: only letters, max 50 characters, and uppercase
        if (name === 'legalName') {
            const filteredValue = value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
            if (filteredValue.length <= 50) {
                setFormData({
                    ...formData,
                    [name]: filteredValue
                });
            }
            return;
        }

        // Strict Position-based Validation for PAN: 5 letters, 4 digits, 1 letter
        if (name === 'pan' && userType !== 'Non Resident Taxable Person') {
            const upCaseValue = value.toUpperCase();
            const lastChar = upCaseValue[upCaseValue.length - 1];
            const currentIndex = upCaseValue.length - 1;

            // Only process if we haven't exceeded 10 characters
            if (upCaseValue.length <= 10) {
                let isValid = true;

                if (currentIndex >= 0 && currentIndex <= 4) {
                    // First 5 characters must be letters
                    if (!/[A-Z]/.test(lastChar)) isValid = false;
                } else if (currentIndex >= 5 && currentIndex <= 8) {
                    // Next 4 characters must be digits
                    if (!/[0-9]/.test(lastChar)) isValid = false;
                } else if (currentIndex === 9) {
                    // Last character must be a letter
                    if (!/[A-Z]/.test(lastChar)) isValid = false;
                }

                // If valid or backspacing (handled by length check usually, but let's be explicit)
                if (isValid || value === '') {
                    setFormData({
                        ...formData,
                        [name]: upCaseValue
                    });
                }
            }
            return;
        }

        // Validation for mobile: digits only, max 10
        if (name === 'mobile') {
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length <= 10) {
                setFormData({
                    ...formData,
                    [name]: digitsOnly
                });
            }
            return;
        }

        // Validation for email: no spaces, lowercase
        if (name === 'email') {
            const noSpaces = value.replace(/\s/g, '').toLowerCase();
            setFormData({
                ...formData,
                [name]: noSpaces
            });
            return;
        }

        // Validation for district: letters only, no double spaces
        if (name === 'district') {
            const lettersAndSpaces = value.replace(/[^a-zA-Z\s]/g, '');
            const singleSpacesOnly = lettersAndSpaces.replace(/\s\s+/g, ' ');
            setFormData({
                ...formData,
                [name]: singleSpacesOnly
            });
            return;
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleOtpChange = (e) => {
        const { name, value } = e.target;
        // Allow only digits and max length 5
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length <= 6) {
            setOtpData({
                ...otpData,
                [name]: digitsOnly
            });
        }
    };
    const handleProceedToTrn = () => {
        setRegType('TRN');
        setStep(1);
        setGeneratedOtps({ emailOtp: '', mobileOtp: '', trnOtp: '' });
        setOtpData({ emailOtp: '', mobileOtp: '' });
    };

    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
    };

    const handleProceed = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (regType === 'New Registration') {
                if (step === 1) {
                    // Check for required fields
                    const requiredFields = ['state', 'legalName', 'email', 'mobile'];
                    if (userType !== 'Non Resident Taxable Person') requiredFields.push('pan');

                    const isMissing = requiredFields.some(field => !formData[field]);

                    if (isMissing) {
                        toast.error('Please fill all required fields');
                        setLoading(false);
                        return;
                    }

                    // PAN basic format validation
                    if (userType !== 'Non Resident Taxable Person') {
                        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
                        if (!panRegex.test(formData.pan)) {
                            toast.error('Invalid PAN format. Standard format: ABCDE1234F');
                            setLoading(false);
                            return;
                        }
                    }

                    // Email validation (Strict)
                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(formData.email)) {
                        toast.error('Please enter a valid email address (e.g., user@example.com).');
                        setLoading(false);
                        return;
                    }

                    // Mobile validation (Indian standard: 10 digits starting with 6-9)
                    const mobileRegex = /^[6-9]\d{9}$/;
                    if (!mobileRegex.test(formData.mobile)) {
                        toast.error('Invalid mobile number. Must be 10 digits starting with 6, 7, 8, or 9.');
                        setLoading(false);
                        return;
                    }

                    const response = await api.post('/registration/step1', {
                        userType,
                        state: formData.state,
                        district: formData.district,
                        legalName: formData.legalName,
                        pan: formData.pan,
                        email: formData.email,
                        mobile: formData.mobile
                    });
                    toast.success(response.data.message);
                    if (response.data.debug) {
                        setGeneratedOtps({
                            emailOtp: response.data.debug.emailOtp,
                            mobileOtp: response.data.debug.mobileOtp
                        });
                    }
                    setOtpData({ emailOtp: '', mobileOtp: '' });
                    setStep(2); // Move to OTP verification
                } else {
                    // Step 2: Verify OTP
                    if (!otpData.emailOtp || !otpData.mobileOtp) {
                        toast.error('Please enter both OTPs');
                        setLoading(false);
                        return;
                    }

                    const response = await api.post('/registration/verify-otp', {
                        email: formData.email,
                        emailOtp: otpData.emailOtp,
                        mobileOtp: otpData.mobileOtp,
                        // Passing the full form data to save to DB upon success
                        userType,
                        state: formData.state,
                        district: formData.district,
                        legalName: formData.legalName,
                        pan: formData.pan,
                        mobile: formData.mobile
                    });

                    if (response.data.success) {
                        toast.success(response.data.message);
                        setFormData(prev => ({ ...prev, trn: response.data.trn }));
                        // Save registration data for dashboard & business details
                        const today = new Date();
                        const fmt = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                        const expiry = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                        localStorage.setItem('gst_trn', response.data.trn || '');
                        localStorage.setItem('gst_reg_date', fmt(today));
                        localStorage.setItem('gst_expiry_date', fmt(expiry));
                        localStorage.setItem('gst_legal_name', formData.legalName || '');
                        localStorage.setItem('gst_pan', formData.pan || '');
                        localStorage.setItem('gst_state', formData.state || '');
                        localStorage.setItem('gst_district', formData.district || '');
                        setStep(3); // Move to success page
                    }
                }
            } else {
                if (step === 1) {
                    if (!formData.trn) {
                        toast.error('Please enter your TRN');
                        setLoading(false);
                        return;
                    }
                    // Simulate generating a TRN OTP
                    const simulatedTrnOtp = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtps(prev => ({ ...prev, trnOtp: simulatedTrnOtp }));
                    setOtpData({ emailOtp: '', mobileOtp: '' }); // Reset input fields
                    toast.success('OTP sent to your registered Mobile and Email.');
                    setStep(2);
                } else {
                    // Step 2: Verify TRN OTP
                    if (!otpData.mobileOtp) { // Reusing mobileOtp as the single field
                        toast.error('Please enter the OTP');
                        setLoading(false);
                        return;
                    }
                    // Verify against the EXACT generated OTP
                    if (otpData.mobileOtp === generatedOtps.trnOtp) {
                        toast.success('OTP Verified successfully. Loading your saved application...');
                        // Fetch the core details from DB so they aren't lost if the user cleared their cache or logged out
                        try {
                            const detailsRes = await api.get(`/auth/trn-details/${formData.trn}`);
                            if (detailsRes.data.success && detailsRes.data.data) {
                                const bd = detailsRes.data.data;
                                localStorage.setItem('gst_legal_name', bd.legal_name || '');
                                localStorage.setItem('gst_pan', bd.pan || '');
                                localStorage.setItem('gst_state', bd.state || '');
                                localStorage.setItem('gst_district', bd.district || '');
                            }
                        } catch (e) {
                            console.warn('Could not fetch historical TRN details, using blanks.', e);
                        }

                        // Save registration date for dashboard
                        const today = new Date();
                        const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
                        const expiryDate = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                        const formattedExpiry = `${String(expiryDate.getDate()).padStart(2, '0')}/${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${expiryDate.getFullYear()}`;
                        localStorage.setItem('gst_trn', formData.trn);
                        localStorage.setItem('gst_reg_date', formattedDate);
                        localStorage.setItem('gst_expiry_date', formattedExpiry);
                        setTimeout(() => {
                            navigate('/business-details');
                        }, 1500);
                    } else {
                        toast.error('Invalid OTP. Please enter the correct code.');
                    }
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isEntityType = ['United Nation Body', 'Consulate or Embassy of Foreign Country', 'Other Notified Person'].includes(userType);
    const isNonResidentOnline = userType === 'Non-Resident Online Services Provider and/or Non-Resident Online Money Gaming Supplier';

    return (
        <>
        <PageLoader loading={loading} />
        <div className="registration-container">
            <div className="registration-card">
                <Toaster position="top-right" />
                {step < 3 && (
                    <div className="registration-header-row">
                        <h1>New Registration</h1>
                        <span className="mandatory-label"><span className="red-dot">●</span> indicates mandatory fields</span>
                    </div>
                )}

                {step === 1 && (
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="regType"
                                checked={regType === 'New Registration'}
                                onChange={() => setRegType('New Registration')}
                            />
                            <span className="radio-custom"></span>
                            New Registration
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="regType"
                                checked={regType === 'TRN'}
                                onChange={() => setRegType('TRN')}
                            />
                            <span className="radio-custom"></span>
                            Temporary Reference Number (TRN)
                        </label>
                    </div>
                )}

                {step < 3 && (
                    <div className="registration-steps-indicator">
                        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                            <div className="step-number">{step > 1 ? '✓' : '1'}</div>
                            <div className="step-label">User Credentials</div>
                        </div>
                        <div className={`step-line ${step > 1 ? 'completed' : ''}`}></div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <div className="step-label">OTP Verification</div>
                        </div>
                    </div>
                )}

                {regType === 'New Registration' ? (
                    step === 1 ? (
                        <form className="registration-form" onSubmit={handleProceed}>
                            <div className="form-group">
                                <label>I am a <span className="red-dot">*</span></label>
                                <select className="form-select" value={userType} onChange={handleUserTypeChange}>
                                    {userTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>State / UT <span className="red-dot">*</span></label>
                                <select className="form-select" name="state" value={formData.state} onChange={handleInputChange}>
                                    {states.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                {(userType === 'Tax Deductor' || userType === 'Tax Collector (e-Commerce)' || isEntityType) && (
                                    <p className="helper-text helper-blue">
                                        <span className="info-icon">ⓘ</span> State selected in Part A, will be the state where you wish to register. Please make your selection carefully.
                                    </p>
                                )}
                            </div>

                            {(userType === 'Taxpayer' || userType === 'GST Practitioner' || userType === 'Non Resident Taxable Person' || isEntityType) && (
                                <div className="form-group">
                                    <label>District</label>
                                    <input type="text" className="form-input" name="district" placeholder="Enter District" value={formData.district} onChange={handleInputChange} />
                                </div>
                            )}

                            <div className="form-group">
                                <label>
                                    {userType === 'Taxpayer' && "Legal Name of the Business "}
                                    {userType === 'Tax Deductor' && "Legal Name of the Tax Deductor "}
                                    {userType === 'Tax Collector (e-Commerce)' && "Legal Name of the Tax Collector "}
                                    {userType === 'GST Practitioner' && "Name of the GST Practitioner "}
                                    {userType === 'Non Resident Taxable Person' && "Legal Name of the Non-Resident Taxable Person "}
                                    {isEntityType && "Legal Name of the Entity "}
                                    {isNonResidentOnline && "Legal Name of the Person "}
                                    {(userType === 'Taxpayer' || userType === 'Tax Deductor' || userType === 'Tax Collector (e-Commerce)') && (
                                        <span className="small-text">(As mentioned in PAN)</span>
                                    )}
                                    {userType === 'GST Practitioner' && <span className="info-icon clickable">ⓘ</span>}
                                    <span className="red-dot">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="legalName"
                                    value={formData.legalName}
                                    onChange={handleInputChange}
                                    maxLength="50"
                                    placeholder={`Enter ${userType === 'GST Practitioner' ? 'Name' : 'Legal Name'} of ${isNonResidentOnline ? 'the person' : (userType === 'Non Resident Taxable Person' ? 'the Non -Resident Taxpayer' : userType)}`}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    {userType === 'Non Resident Taxable Person' && "Name of Authorized Signatory (as per PAN)"}
                                    {(userType === 'Taxpayer' || userType === 'Tax Deductor' || userType === 'Tax Collector (e-Commerce)' || userType === 'GST Practitioner') && "Permanent Account Number (PAN)"}
                                    {isEntityType && "Permanent Account Number (PAN) of entity"}
                                    {isNonResidentOnline && "Permanent Account Number (PAN) of person"}
                                    {!['Non Resident Taxable Person', 'Taxpayer', 'Tax Deductor', 'Tax Collector (e-Commerce)', 'GST Practitioner', 'United Nation Body', 'Consulate or Embassy of Foreign Country', 'Other Notified Person', 'Non-Resident Online Services Provider and/or Non-Resident Online Money Gaming Supplier'].includes(userType) && "Permanent Account Number (PAN)"}
                                    {(userType !== 'Non Resident Taxable Person' && !isEntityType && !isNonResidentOnline) && <span className="red-dot">*</span>}
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="pan"
                                    value={formData.pan}
                                    onChange={handleInputChange}
                                    maxLength="10"
                                    placeholder={userType === 'Non Resident Taxable Person' ? "Enter Name of Authorized Signatory" : "Enter Permanent Account Number (PAN)"}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Email Address <span className="red-dot">*</span>
                                </label>
                                <div className="input-with-icon">
                                    <span className="input-icon">✉</span>
                                    <input type="email" className="form-input" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter Email Address" />
                                </div>
                                <p className="helper-text"><span className="info-icon">ⓘ</span> OTP will be sent to this Email Address</p>
                            </div>

                            <div className="form-group">
                                <label>
                                    Mobile Number <span className="red-dot">*</span>
                                </label>
                                <div className="input-with-icon mobile-input">
                                    <span className="country-code">+91</span>
                                    <input type="tel" className="form-input" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="Enter Mobile Number" />
                                </div>
                                <p className="helper-text"><span className="info-icon">ⓘ</span> Separate OTP will be sent to this mobile number</p>
                            </div>

                            <button type="submit" className="btn-proceed" disabled={loading}>
                                {loading ? 'PROCESSING...' : 'PROCEED'}
                            </button>
                        </form>
                    ) : step === 2 ? (
                        // Step 2: Verify OTP
                        <div className="otp-verification-step">
                            <h2 className="step-heading">Verify OTP</h2>
                            <span className="mandatory-label-small"><span className="red-dot">●</span> Indicates mandatory fields</span>

                            <form className="registration-form" onSubmit={handleProceed}>
                                <div className="form-group">
                                    <label>Mobile OTP <span className="red-dot">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="mobileOtp"
                                        placeholder="Enter Mobile OTP"
                                        value={otpData.mobileOtp}
                                        onChange={handleOtpChange}
                                        maxLength="6"
                                        autocomplete="off"
                                    />
                                    <p className="helper-text"><span className="info-icon">ⓘ</span> Enter OTP sent to your mobile number</p>
                                    {generatedOtps.mobileOtp && (
                                        <p className="helper-text helper-blue" style={{ fontWeight: '600', color: '#2b6cb0' }}>
                                            Simulated Mobile OTP: {generatedOtps.mobileOtp}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Email OTP <span className="red-dot">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="emailOtp"
                                        placeholder="Enter Email OTP"
                                        value={otpData.emailOtp}
                                        onChange={handleOtpChange}
                                        maxLength="6"
                                        autocomplete="off"
                                    />
                                    <p className="helper-text"><span className="info-icon">ⓘ</span> Enter OTP sent to your Email Address</p>
                                    {generatedOtps.emailOtp && (
                                        <p className="helper-text helper-blue" style={{ fontWeight: '600', color: '#2b6cb0' }}>
                                            Simulated Email OTP: {generatedOtps.emailOtp}
                                        </p>
                                    )}
                                    <p className="helper-text small-muted"><span className="info-icon">ⓘ</span> Please check the junk/spam folder in case you do not get email.</p>
                                </div>

                                <div className="resent-otp-link">
                                    <a href="#" onClick={(e) => e.preventDefault()}>Need OTP to be resent? Click here</a>
                                </div>

                                <div className="form-actions-row">
                                    <button type="button" className="btn-back" onClick={() => setStep(1)}>BACK</button>
                                    <button type="submit" className="btn-proceed-small" disabled={loading}>
                                        {loading ? 'PROCESSING...' : 'PROCEED'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : step === 3 ? (
                        <div className="registration-success-step">
                            <div className="breadcrumb-small">Services &gt; Registration &gt; <strong>Verify</strong></div>

                            <div className="success-banner">
                                <p>You have successfully submitted Part A of the registration process. Your Temporary Reference Number (TRN) is <strong>{formData.trn}</strong>.</p>
                            </div>

                            <div className="success-details">
                                <p>Using this TRN you can access the application from My saved Applications and submit on GST Portal. Part B of the application form needs to be completed within 15 days, i.e. by '<strong>{new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}</strong>' using this TRN.</p>
                            </div>

                            <div className="form-actions-row" style={{ justifyContent: 'flex-end', marginTop: '30px' }}>
                                <button type="button" className="btn-proceed-small" onClick={handleProceedToTrn}>PROCEED</button>
                            </div>
                        </div>
                    ) : null
                ) : (
                    step === 1 ? (
                        <form className="registration-form" onSubmit={handleProceed}>
                            <div className="form-group">
                                <label>Temporary Reference Number (TRN) <span className="red-dot">*</span></label>
                                <input type="text" className="form-input" name="trn" value={formData.trn} onChange={handleInputChange} placeholder="Enter Temporary Reference Number (TRN)" />
                            </div>
                            <button type="submit" className="btn-proceed" disabled={loading}>
                                {loading ? 'PROCESSING...' : 'PROCEED'}
                            </button>
                        </form>
                    ) : (
                        <div className="otp-verification-step">
                            <div className="breadcrumb-small" style={{ marginBottom: '15px' }}>Home &gt; Registration &gt; <strong>Verify</strong></div>
                            <h2 className="step-heading">Verify OTP</h2>
                            <span className="mandatory-label-small"><span className="red-dot">●</span> Indicates mandatory fields</span>

                            <form className="registration-form" onSubmit={handleProceed}>
                                <div className="form-group">
                                    <label>Mobile / Email OTP <span className="red-dot">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="mobileOtp"
                                        placeholder="Enter Mobile / Email OTP"
                                        value={otpData.mobileOtp}
                                        onChange={handleOtpChange}
                                        maxLength="6"
                                        autocomplete="off"
                                    />
                                    <div className="helper-text" style={{ marginTop: '10px' }}>
                                        <p><span className="info-icon">ⓘ</span> Fill OTP sent to Mobile and Email</p>
                                        <p><span className="info-icon">ⓘ</span> Please check the junk/spam folder in case you do not get email.</p>
                                    </div>
                                    {generatedOtps.trnOtp && (
                                        <p className="helper-text helper-blue" style={{ fontWeight: '600', color: '#2b6cb0', marginTop: '5px' }}>
                                            Simulated Mobile / Email OTP: {generatedOtps.trnOtp}
                                        </p>
                                    )}
                                </div>

                                <div className="resent-otp-link">
                                    <a href="#" onClick={(e) => e.preventDefault()}>Need OTP to be resent? Click here</a>
                                </div>

                                <div className="form-actions-row">
                                    <button type="button" className="btn-back" onClick={() => setStep(1)}>BACK</button>
                                    <button type="submit" className="btn-proceed-small" disabled={loading}>
                                        {loading ? 'PROCESSING...' : 'PROCEED'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )
                )}
            </div>

            <button className="btn-back-to-top">
                <span className="arrow-up">^</span>
                <span className="top-text">Top</span>
            </button>
        </div>
        </>
    );
};

export default Registration;
