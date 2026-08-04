import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import RegistrationTabPage from '../components/RegistrationTabPage';
import { useFormSave } from '../hooks/useFormSave';
import api from '../api/axios';

const Verification = () => {
    const navigate = useNavigate();
    const { handleSaveAndContinue, isSaving } = useFormSave('Verification', null); // Don't redirect immediately
    const [verified, setVerified] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [credentials, setCredentials] = useState(null);
    const [availableNames, setAvailableNames] = useState([]);
    const [form, setForm] = useState({
        declarerName: '',
        place: '',
        designation: 'Proprietor'
    });

    useEffect(() => {
        const fetchNames = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const namesSet = new Set();
                
                // Helper to safely format name
                const formatName = (data) => {
                    if (!data) return null;
                    const name = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ').trim();
                    return name ? name.toUpperCase() : null;
                };

                // Add Legal Name from Local Storage as Fallback
                const legalName = localStorage.getItem('gst_legal_name');
                if (legalName) namesSet.add(legalName.toUpperCase());

                // Fetch Business Details (Proprietor)
                try {
                    const bdRes = await api.get(`/forms/tab/${trn}/BusinessDetails`);
                    if (bdRes.data?.tradeName) namesSet.add(bdRes.data.tradeName.toUpperCase());
                } catch (e) {
                    console.log("No BusinessDetails found");
                }

                // Fetch Promoter/Partners
                try {
                    const ppRes = await api.get(`/forms/tab/${trn}/PromoterPartners`);
                    const ppName = formatName(ppRes.data);
                    if (ppName) namesSet.add(ppName);
                } catch (e) {
                    console.log("No PromoterPartners found");
                }

                // Fetch Authorized Signatory
                try {
                    const asRes = await api.get(`/forms/tab/${trn}/AuthorizedSignatory`);
                    const asName = formatName(asRes.data);
                    if (asName) namesSet.add(asName);
                } catch (e) {
                    console.log("No AuthorizedSignatory found");
                }
                
                setAvailableNames(Array.from(namesSet));
            } catch (err) {
                console.error("Error fetching names:", err);
            }
        };
        fetchNames();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        try {
            // Include form data explicitly to ensure it's saved correctly
            const submissionData = {
                ...form,
                verified: verified
            };
            
            // First save the final tab data
            await handleSaveAndContinue(e, submissionData);
            
            setIsCompleting(true);
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const legalName = localStorage.getItem('gst_legal_name');
            const pan = localStorage.getItem('gst_pan');

            const response = await api.post('/registration/complete', { trn, legalName, pan });
            
            if (response.data.success) {
                setCredentials(response.data.credentials);
                toast.success('Application submitted and credentials generated!');
                // Clear the TRN from storage since it won't work anymore
                localStorage.removeItem('gst_trn');
                localStorage.removeItem('trn');
            }
        } catch (err) {
            console.error("Submission error:", err);
            const errorMsg = err.response?.data?.details || err.response?.data?.message || 'Error completing registration.';
            toast.error(errorMsg);
        } finally {

            setIsCompleting(false);
        }
    };

    if (credentials) {
        return (
            <RegistrationTabPage activeIndex={9} breadcrumb="Success">
                <style>{`
                    .success-card {
                        background: white;
                        padding: 40px;
                        border-radius: 16px;
                        box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                        max-width: 600px;
                        margin: 40px auto;
                        text-align: center;
                        border: 1px solid #e2e8f0;
                        animation: slideUp 0.5s ease-out;
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .success-icon {
                        width: 80px;
                        height: 80px;
                        background: #f0fff4;
                        color: #38a169;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 40px;
                        margin: 0 auto 24px;
                    }
                    .cred-box {
                        background: #f8fafc;
                        border: 2px dashed #cbd5e0;
                        border-radius: 12px;
                        padding: 24px;
                        margin: 24px 0;
                        text-align: left;
                    }
                    .cred-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-bottom: 1px solid #edf2f7;
                    }
                    .cred-row:last-child { border-bottom: none; }
                    .cred-label { color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase; }
                    .cred-value { color: #1e293b; font-weight: 700; font-family: 'Courier New', Courier, monospace; font-size: 18px; letter-spacing: 1px; }
                    .copy-btn {
                        background: none;
                        border: 1px solid #cbd5e0;
                        padding: 4px 8px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        color: #64748b;
                        transition: all 0.2s;
                    }
                    .copy-btn:hover { background: #edf2f7; border-color: #94a3b8; }
                `}</style>

                <div className="success-card">
                    <div className="success-icon">✅</div>
                    <h2 style={{ color: '#1a365d', marginBottom: '8px', fontSize: '28px' }}>Registration Successful</h2>
                    <p style={{ color: '#4a5568', fontSize: '16px', lineHeight: '1.6' }}>
                        Your application has been successfully filed. As per policy, temporary login credentials have been generated for your account.
                    </p>
                    
                    <div className="cred-box">
                        <div style={{ marginBottom: '16px', fontWeight: 'bold', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>🔐</span> Generated Credentials
                        </div>
                        
                        <div className="cred-row">
                            <span className="cred-label">GSTIN</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="cred-value" style={{ color: '#0d9488' }}>{credentials.gstin || 'PENDING'}</span>
                                <button className="copy-btn" onClick={() => {
                                    navigator.clipboard.writeText(credentials.gstin);
                                    toast.success('GSTIN copied!');
                                }}>Copy</button>
                            </div>
                        </div>

                        <div className="cred-row">
                            <span className="cred-label">Username</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="cred-value">{credentials.username}</span>
                                <button className="copy-btn" onClick={() => {
                                    navigator.clipboard.writeText(credentials.username);
                                    toast.success('Username copied!');
                                }}>Copy</button>
                            </div>
                        </div>

                        <div className="cred-row">
                            <span className="cred-label">Password</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span className="cred-value">{credentials.password}</span>
                                <button className="copy-btn" onClick={() => {
                                    navigator.clipboard.writeText(credentials.password);
                                    toast.success('Password copied!');
                                }}>Copy</button>
                            </div>
                        </div>
                    </div>

                    <p style={{ fontSize: '14px', color: '#e53e3e', fontWeight: '600', marginBottom: '24px' }}>
                        ⚠ These are your temporary login credentials. Please save them carefully. They will be required to access your account.
                    </p>

                    <button 
                        style={{ 
                            padding: '16px 32px', 
                            backgroundColor: '#1a3a6e', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '100%',
                            fontSize: '16px',
                            boxShadow: '0 4px 6px rgba(26, 58, 110, 0.2)'
                        }}
                        onClick={() => navigate('/login')}
                    >
                        Login Now
                    </button>
                </div>
            </RegistrationTabPage>
        );
    }


    return (
        <RegistrationTabPage activeIndex={9} breadcrumb="Verification">
            <Toaster position="top-right" />

            <div style={{ marginTop: '20px' }}>
                <span className="red-dot" style={{ float: 'right', fontSize: '20px', lineHeight: '10px' }}>•</span>
                <div style={{ clear: 'both' }}></div>

                <div className="vf-declaration-box">
                    <input
                        type="checkbox"
                        className="vf-checkbox"
                        checked={verified}
                        onChange={e => setVerified(e.target.checked)}
                    />
                    <span className="vf-declaration-text">
                        I hereby solemnly affirm and declare that the information given herein above is true and correct to the
                        best of my knowledge and belief and nothing has been concealed therefrom.
                    </span>
                </div>

                <div className="bd-form-row two-col" style={{ marginTop: '30px' }}>
                    <div className="bd-form-group">
                        <span className="red-dot" style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>•</span>
                        <label className="bd-label" style={{ display: 'none' }}>Name of Authorized Signatory</label>
                        <select 
                            className="bd-select" 
                            style={{ width: '100%' }}
                            name="declarerName"
                            value={form.declarerName}
                            onChange={handleChange}
                        >
                            <option value="">Select</option>
                            {availableNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="bd-form-group">
                        <span className="red-dot" style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>•</span>
                        <label className="bd-label" style={{ display: 'none' }}>Place</label>
                        <input
                            type="text"
                            className="bd-input"
                            name="place"
                            placeholder="Place"
                            value={form.place}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="bd-form-row two-col">
                    <div className="bd-form-group">
                        <span className="red-dot" style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>•</span>
                        <label className="bd-label" style={{ display: 'none' }}>Designation / Status</label>
                        <input
                            type="text"
                            className="bd-input"
                            name="designation"
                            placeholder="Designation / Status"
                            value={form.designation}
                            readOnly
                        />
                    </div>
                    <div className="bd-form-group">
                        {/* Empty column to match layout */}
                    </div>
                </div>

                <div style={{ marginTop: '15px' }}>
                    <span className="bd-info-icon" style={{ color: 'black', fontSize: '13px' }}>ⓘ</span>
                    <a href="#" style={{ color: '#3182ce', fontSize: '13px', textDecoration: 'none', marginLeft: '5px' }}>
                        Facing problem using DSC? Click here for help
                    </a>
                </div>

            </div>

            <div className="bd-actions" style={{ marginTop: '60px' }}>
                <button className="bd-back-btn" onClick={() => navigate('/aadhaar-authentication')}>BACK</button>
                <button
                    className="bd-save-btn"
                    style={{ background: '#1a3a6e' }}
                    disabled={!verified || isSaving || isCompleting}
                    onClick={handleSubmit}
                >
                    {isCompleting ? 'SUBMITTING...' : 'SUBMIT WITH DSC'}
                </button>
                <button
                    className="bd-save-btn"
                    style={{ background: '#1a3a6e' }}
                    onClick={handleSubmit}
                    disabled={!verified || isSaving || isCompleting}
                >
                    {isSaving || isCompleting ? 'SUBMITTING...' : 'SUBMIT WITH EVC'}
                </button>
            </div>
        </RegistrationTabPage>
    );
};

export default Verification;

