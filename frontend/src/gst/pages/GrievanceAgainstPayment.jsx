import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const GrievanceAgainstPayment = () => {
    const [activeTab, setActiveTab] = useState('submit');
    const fileInputRef = useRef(null);

    // Submit Grievance State
    const [formData, setFormData] = useState({
        previousGrievance: '',
        grievanceRelatedTo: '',
        state: '',
        gstin: '',
        businessNameAddress: '',
        complainantName: '',
        email: '',
        mobile: '',
        pan: '',
        description: '',
        cpin: ''
    });

    const [errors, setErrors] = useState({});
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState('');

    // Enquire Status State
    const [enquireGrievanceNumber, setEnquireGrievanceNumber] = useState('');
    const [enquireError, setEnquireError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFileError('');
        
        if (selectedFile) {
            const fileType = selectedFile.type;
            const fileSize = selectedFile.size / 1024; // KB

            if (fileType !== 'application/pdf' && fileType !== 'image/jpeg') {
                setFileError('File with PDF or JPEG format is only allowed.');
                setFile(null);
                return;
            }

            if (fileSize > 500) {
                setFileError('Maximum file size for upload is 500 KB.');
                setFile(null);
                return;
            }

            setFile(selectedFile);
        }
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePan = (pan) => {
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(pan);
    };

    const handleReset = () => {
        setFormData({
            previousGrievance: '',
            grievanceRelatedTo: '',
            state: '',
            gstin: '',
            businessNameAddress: '',
            complainantName: '',
            email: '',
            mobile: '',
            pan: '',
            description: '',
            cpin: ''
        });
        setErrors({});
        setFile(null);
        setFileError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (type) => {
        const newErrors = {};

        if (!formData.grievanceRelatedTo) newErrors.grievanceRelatedTo = 'This field is required';
        if (!formData.state) newErrors.state = 'This field is required';
        if (!formData.gstin) newErrors.gstin = 'This field is required';
        
        if (!formData.businessNameAddress) {
            newErrors.businessNameAddress = 'This field is required';
        } else if (formData.businessNameAddress.length < 3 || formData.businessNameAddress.length > 2000) {
            newErrors.businessNameAddress = 'Name and Address of Business should be of 3 to 2000 characters';
        }

        if (!formData.complainantName) {
            newErrors.complainantName = 'This field is required';
        } else if (formData.complainantName.length < 3 || formData.complainantName.length > 200) {
            newErrors.complainantName = 'Name of Complainant should be of 3 to 200 characters';
        }

        if (!formData.email) {
            newErrors.email = 'This field is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.mobile) {
            newErrors.mobile = 'This field is required';
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Mobile number must be 10 digits';
        }

        if (formData.pan && !validatePan(formData.pan)) {
            newErrors.pan = 'Invalid PAN format';
        }

        if (!formData.description) newErrors.description = 'This field is required';
        if (!formData.cpin) newErrors.cpin = 'This field is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Proceed logic for type (DSC or EVC)
        console.log(`Submitting with ${type}`);
    };

    const handleEnquireSearch = (e) => {
        e.preventDefault();
        if (!enquireGrievanceNumber.trim()) {
            setEnquireError('This field is required');
        } else {
            setEnquireError('');
            // Logic to enquire
        }
    };

    // Styling helpers
    const labelStyle = { display: 'block', fontSize: '13px', color: '#333', marginBottom: '5px', fontWeight: '500' };
    const inputStyle = (hasError) => ({
        width: '100%',
        padding: '8px 12px',
        fontSize: '13px',
        border: `1px solid ${hasError ? '#d32f2f' : '#ccc'}`,
        borderRadius: '4px',
        outline: 'none',
        boxSizing: 'border-box'
    });
    const errorStyle = { color: '#d32f2f', fontSize: '11px', marginTop: '4px' };
    const helperStyle = { color: '#666', fontSize: '11px', marginTop: '4px' };

    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 60px', minHeight: 'calc(100vh - 200px)' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Services</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Payments</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Grievance against Payment (GST PMT-07)</span>
            </div>

            {/* Main Content Box */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8f9fa' }}>
                    <div 
                        onClick={() => setActiveTab('submit')}
                        style={{ 
                            padding: '15px 25px', 
                            cursor: 'pointer', 
                            fontSize: '15px', 
                            fontWeight: '500',
                            color: activeTab === 'submit' ? '#0f4c81' : '#555',
                            borderBottom: activeTab === 'submit' ? '3px solid #1eb3a6' : '3px solid transparent',
                            backgroundColor: activeTab === 'submit' ? '#fff' : 'transparent'
                        }}
                    >
                        Submit Grievance
                    </div>
                    <div 
                        onClick={() => setActiveTab('enquire')}
                        style={{ 
                            padding: '15px 25px', 
                            cursor: 'pointer', 
                            fontSize: '15px', 
                            fontWeight: '500',
                            color: activeTab === 'enquire' ? '#0f4c81' : '#555',
                            borderBottom: activeTab === 'enquire' ? '3px solid #1eb3a6' : '3px solid transparent',
                            backgroundColor: activeTab === 'enquire' ? '#fff' : 'transparent'
                        }}
                    >
                        Enquire Status
                    </div>
                </div>

                {/* Tab Content */}
                <div style={{ padding: '30px' }}>
                    {activeTab === 'submit' && (
                        <div>
                            <div style={{ textAlign: 'right', marginBottom: '20px', fontSize: '13px', color: '#d32f2f' }}>
                                <span style={{ fontSize: '16px' }}>•</span> indicates mandatory fields
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>Grievance Type: </label>
                                <span style={{ fontSize: '14px', color: '#555' }}>Grievance Against Payment (GST PMT 07)</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div>
                                    <label style={labelStyle}>Previous Grievance Number</label>
                                    <input 
                                        type="text" 
                                        name="previousGrievance"
                                        value={formData.previousGrievance}
                                        onChange={handleInputChange}
                                        placeholder="Enter Previous Grievance Number"
                                        style={inputStyle(false)}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Grievance Related to <span style={{ color: '#d32f2f' }}>*</span></label>
                                    <select 
                                        name="grievanceRelatedTo"
                                        value={formData.grievanceRelatedTo}
                                        onChange={handleInputChange}
                                        style={inputStyle(errors.grievanceRelatedTo)}
                                    >
                                        <option value="">Select</option>
                                        <option value="option1">Option 1</option>
                                    </select>
                                    {errors.grievanceRelatedTo && <div style={errorStyle}>{errors.grievanceRelatedTo}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>State <span style={{ color: '#d32f2f' }}>*</span></label>
                                    <select 
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        style={inputStyle(errors.state)}
                                    >
                                        <option value="">Select</option>
                                        <option value="state1">State 1</option>
                                    </select>
                                    {errors.state && <div style={errorStyle}>{errors.state}</div>}
                                </div>
                            </div>

                            <h3 style={{ color: '#001b5c', fontSize: '16px', fontWeight: '500', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                Details of Taxpayer(Person) who is reporting the grievance
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>GSTIN / Other ID <span style={{ color: '#d32f2f' }}>*</span></label>
                                    <input 
                                        type="text" 
                                        name="gstin"
                                        value={formData.gstin}
                                        onChange={handleInputChange}
                                        placeholder="Enter GSTIN / Other ID"
                                        style={inputStyle(errors.gstin)}
                                    />
                                    {errors.gstin && <div style={errorStyle}>{errors.gstin}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Name and Address of Business <span style={{ color: '#d32f2f' }}>*</span></label>
                                    <input 
                                        type="text" 
                                        name="businessNameAddress"
                                        value={formData.businessNameAddress}
                                        onChange={handleInputChange}
                                        placeholder="Enter Name & Address of business"
                                        style={inputStyle(errors.businessNameAddress)}
                                    />
                                    <div style={helperStyle}>Name and Address of Business should be of 3 to 2000 characters, can contain alphabets, numbers and special characters (- . , \ / ')</div>
                                    {errors.businessNameAddress && <div style={errorStyle}>{errors.businessNameAddress}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Name of Complainant <span style={{ color: '#d32f2f' }}>*</span></label>
                                    <input 
                                        type="text" 
                                        name="complainantName"
                                        value={formData.complainantName}
                                        onChange={handleInputChange}
                                        placeholder="Enter Name of Complainant"
                                        style={inputStyle(errors.complainantName)}
                                    />
                                    <div style={helperStyle}>Name of Complainant should be of 3 to 200 characters, can contain alphabets and special characters (. ')</div>
                                    {errors.complainantName && <div style={errorStyle}>{errors.complainantName}</div>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div>
                                    <label style={labelStyle}>Email Address <span style={{ color: '#d32f2f' }}>*</span></label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter Email Address"
                                        style={inputStyle(errors.email)}
                                    />
                                    {errors.email && <div style={errorStyle}>{errors.email}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Mobile Number <span style={{ color: '#d32f2f' }}>*</span></label>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ padding: '8px 12px', backgroundColor: '#f1f3f6', border: '1px solid #ccc', borderRight: 'none', borderRadius: '4px 0 0 4px', fontSize: '13px', color: '#555' }}>+91</span>
                                        <input 
                                            type="text" 
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleInputChange}
                                            placeholder="Enter Mobile Number"
                                            style={{ ...inputStyle(errors.mobile), borderRadius: '0 4px 4px 0' }}
                                        />
                                    </div>
                                    {errors.mobile && <div style={errorStyle}>{errors.mobile}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Permanent Account Number (PAN)</label>
                                    <input 
                                        type="text" 
                                        name="pan"
                                        value={formData.pan}
                                        onChange={handleInputChange}
                                        placeholder="Enter Permanent Account Number (PAN)"
                                        style={inputStyle(errors.pan)}
                                    />
                                    <div style={helperStyle}>Company, LLP and Non-resident user can enter authorised signatory's PAN</div>
                                    {errors.pan && <div style={errorStyle}>{errors.pan}</div>}
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={labelStyle}>Description of Grievance (4000 characters) <span style={{ color: '#d32f2f' }}>*</span></label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter Grievance description"
                                    maxLength={4000}
                                    rows={4}
                                    style={{ ...inputStyle(errors.description), resize: 'vertical' }}
                                />
                                {errors.description && <div style={errorStyle}>{errors.description}</div>}
                            </div>

                            <h3 style={{ color: '#001b5c', fontSize: '16px', fontWeight: '500', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                Upload Supporting Document
                            </h3>
                            <div style={{ marginBottom: '30px' }}>
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    style={{ fontSize: '13px' }}
                                    accept=".pdf,.jpg,.jpeg"
                                />
                                <div style={{ ...helperStyle, marginTop: '10px' }}>
                                    • File with PDF or JPEG format is only allowed.<br/>
                                    • Maximum file size for upload is 500 KB.
                                </div>
                                {fileError && <div style={errorStyle}>{fileError}</div>}
                            </div>

                            <h3 style={{ color: '#001b5c', fontSize: '16px', fontWeight: '500', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                                Discrepancy In Payments
                            </h3>
                            <div style={{ marginBottom: '40px', maxWidth: '300px' }}>
                                <label style={labelStyle}>CPIN <span style={{ color: '#d32f2f' }}>*</span></label>
                                <input 
                                    type="text" 
                                    name="cpin"
                                    value={formData.cpin}
                                    onChange={handleInputChange}
                                    placeholder="Enter CPIN"
                                    style={inputStyle(errors.cpin)}
                                />
                                <div style={helperStyle}>Enter 'Grievance Related to', 'State' and 'GSTIN/UIN/Temporary ID' first</div>
                                {errors.cpin && <div style={errorStyle}>{errors.cpin}</div>}
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button 
                                    onClick={handleReset}
                                    style={{ padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #0f4c81', color: '#0f4c81', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                                >
                                    RESET
                                </button>
                                <button 
                                    onClick={() => handleSubmit('DSC')}
                                    style={{ padding: '10px 20px', backgroundColor: '#0f4c81', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                                >
                                    SUBMIT WITH DSC
                                </button>
                                <button 
                                    onClick={() => handleSubmit('EVC')}
                                    style={{ padding: '10px 20px', backgroundColor: '#0f4c81', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                                >
                                    SUBMIT WITH EVC
                                </button>
                            </div>

                        </div>
                    )}

                    {activeTab === 'enquire' && (
                        <div style={{ maxWidth: '400px' }}>
                            <form onSubmit={handleEnquireSearch}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>Grievance Number <span style={{ color: '#d32f2f' }}>*</span></label>
                                    <input 
                                        type="text" 
                                        value={enquireGrievanceNumber}
                                        onChange={(e) => {
                                            setEnquireGrievanceNumber(e.target.value);
                                            if (e.target.value.trim()) setEnquireError('');
                                        }}
                                        placeholder="Enter Grievance Number"
                                        style={inputStyle(enquireError)}
                                    />
                                    {enquireError && <div style={errorStyle}>{enquireError}</div>}
                                </div>
                                <button 
                                    type="submit" 
                                    style={{ padding: '10px 24px', backgroundColor: '#0f4c81', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
                                >
                                    SEARCH
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GrievanceAgainstPayment;
