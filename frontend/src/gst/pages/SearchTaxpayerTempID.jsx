import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const SearchTaxpayerTempID = () => {
    const [temporaryId, setTemporaryId] = useState('');
    const [state, setState] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [taxpayer, setTaxpayer] = useState(null);

    const states = [
        "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
        "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli",
        "Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
        "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
        "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra",
        "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
        "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ];


    const handleMobileChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length <= 10) setMobileNumber(val);
    };

    const validateForm = () => {
        let newErrors = {};
        
        if (temporaryId.trim() === '') {
            if (state === '') {
                newErrors.state = 'Please select a State.';
            }
            if (mobileNumber.trim() === '') {
                newErrors.mobileNumber = 'Please enter Mobile Number.';
            } else if (mobileNumber.length !== 10) {
                newErrors.mobileNumber = 'Mobile Number must be 10 digits.';
            }
            if (captchaInput.trim() === '') {
                newErrors.captcha = 'Please enter captcha characters.';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setTaxpayer(null);
        setErrors({});

        try {
            const response = await api.post('/search-taxpayer/temp-id', {
                temporaryId,
                state: temporaryId ? undefined : state,
                mobileNumber: temporaryId ? undefined : mobileNumber
            });
            
            const data = response.data;

            if (data.success) {
                setTaxpayer(data.data);
            } else {
                setErrors({ general: data.error || 'No record found for the entered details.' });
            }
        } catch (err) {
            console.error('Search error:', err);
            setErrors({ general: 'Unable to Fetch Temporary ID Details. Please Try Again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Breadcrumb Area */}
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px' }}>
                    <Link to="/" style={{ color: '#0056b3', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
                    <span style={{ color: '#666', margin: '0 8px', fontSize: '14px' }}>&gt;</span>
                    <span style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>Search Temporary ID</span>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
                <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ color: '#001b5c', margin: 0, fontSize: '18px', fontWeight: 'normal' }}>Search Taxpayer</h2>
                        <span style={{ color: '#d32f2f', fontSize: '12px' }}>* indicates mandatory fields</span>
                    </div>
                    
                    <div style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                            {/* Option 1 */}
                            <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                                <h3 style={{ fontSize: '16px', color: '#001b5c', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Option 1</h3>
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#333' }}>
                                        Enter Temporary ID <span style={{ color: '#d32f2f' }}>*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={temporaryId}
                                        onChange={(e) => {
                                            setTemporaryId(e.target.value.toUpperCase());
                                            if (errors.general) setErrors({});
                                        }}
                                        placeholder="Enter Temporary ID"
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px 12px', 
                                            border: '1px solid #ccc', 
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontWeight: 'bold', margin: '0 20px' }}>
                                OR
                            </div>

                            {/* Option 2 */}
                            <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                                <h3 style={{ fontSize: '16px', color: '#001b5c', marginBottom: '15px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Option 2</h3>
                                
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#333' }}>
                                        Select State <span style={{ color: '#d32f2f' }}>*</span>
                                    </label>
                                    <select 
                                        value={state}
                                        onChange={(e) => {
                                            setState(e.target.value);
                                            if (errors.state) setErrors({...errors, state: null});
                                        }}
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px 12px', 
                                            border: '1px solid #ccc', 
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">Select</option>
                                        {states.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                                    </select>
                                    {errors.state && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.state}</div>}
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#333' }}>
                                        Enter Mobile Number <span style={{ color: '#d32f2f' }}>*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={mobileNumber}
                                        onChange={(e) => {
                                            handleMobileChange(e);
                                            if (errors.mobileNumber) setErrors({...errors, mobileNumber: null});
                                        }}
                                        placeholder="Enter Mobile Number"
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px 12px', 
                                            border: '1px solid #ccc', 
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                    {errors.mobileNumber && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.mobileNumber}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Captcha Section */}
                        <div style={{ maxWidth: '400px', marginTop: '10px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#333' }}>
                                Type the characters you see in the image below <span style={{ color: '#d32f2f' }}>*</span>
                            </label>
                            <input 
                                type="text" 
                                value={captchaInput}
                                onChange={(e) => {
                                    setCaptchaInput(e.target.value);
                                    if (errors.captcha) setErrors({...errors, captcha: null});
                                }}
                                placeholder="Enter Characters shown below"
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 12px', 
                                    border: '1px solid #ccc', 
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    marginBottom: '10px'
                                }}
                            />
                            {errors.captcha && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '-5px', marginBottom: '10px' }}>{errors.captcha}</div>}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ backgroundColor: '#f0f0f0', border: '1px solid #ccc', padding: '10px 30px', fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', fontStyle: 'italic', color: '#444' }}>
                                    489234
                                </div>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Play Captcha Audio">🔊</button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Refresh Captcha">🔄</button>
                            </div>
                        </div>

                        {errors.general && (
                            <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span>ℹ️</span> {errors.general}
                            </div>
                        )}

                        <button 
                            onClick={handleSearch}
                            disabled={loading}
                            style={{ 
                                backgroundColor: '#0f4c81', 
                                color: 'white', 
                                border: 'none', 
                                padding: '10px 30px', 
                                borderRadius: '4px', 
                                marginTop: '30px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'SEARCHING...' : 'SEARCH'}
                        </button>
                    </div>
                </div>

                {/* Result Section */}
                {taxpayer && !loading && (
                    <div style={{ marginTop: '30px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#0f4c81', color: '#fff', padding: '15px 20px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'normal' }}>Temporary ID Details</h3>
                        </div>
                        
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                
                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Temporary ID</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.temporary_id}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Applicant Name</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.applicant_name}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>State</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.state}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Mobile Number</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.mobile_number}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Application Type</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.application_type}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Status</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.status}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Created Date</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.created_date}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchTaxpayerTempID;
