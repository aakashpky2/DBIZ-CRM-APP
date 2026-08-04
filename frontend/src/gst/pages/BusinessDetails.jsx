import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import { TABS } from '../components/RegistrationTabPage';
import { useFormSave } from '../hooks/useFormSave';
import './BusinessDetails.css';

const SUB_MENUS = {
    services: [
        { label: 'Registration', to: '/registration' },
        { label: 'Payments', to: '#' },
        { label: 'User Services', to: '#' },
        { label: 'Refunds', to: '#' },
        { label: 'e-Way Bill System', to: '#' },
        { label: 'Track Application Status', to: '#' },
    ],
    downloads: [
        { label: 'Offline Tools', to: '#' },
        { label: 'GST Statistics', to: '#' },
    ],
    search: [
        { label: 'Search by GSTIN/UIN', to: '#' },
        { label: 'Search by PAN', to: '#' },
        { label: 'Search Temporary ID', to: '#' },
        { label: 'Search Composition Taxpayer', to: '#' },
    ],
};

const BusinessDetails = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const { handleSaveAndContinue: saveAllDetails, loadedData } = useFormSave('BusinessDetails', null);

    // Read data saved during registration
    const legalName = localStorage.getItem('gst_legal_name') || 'Not Provided';
    const pan = localStorage.getItem('gst_pan') || 'Not Provided';
    const stateName = localStorage.getItem('gst_state') || 'Not Provided';
    const district = localStorage.getItem('gst_district') || '';
    const expiryDate = localStorage.getItem('gst_expiry_date') || '—';
    const lastModified = localStorage.getItem('gst_reg_date') || '—';

    const [formData, setFormData] = useState({
        tradeName: '',
        additionalTrade: '',
        constitution: '',
        district: district,
        casualTaxable: false,
        composition: false,
        rule14A: '',
        reason: '',
        commencementDate: '',
        liabilityDate: '',
        regType: '',
        regNo: '',
        regDate: '',
    });

    // Constitution types — fetched from DB, falls back to official GST portal list
    const [constitutionOptions, setConstitutionOptions] = useState([]);
    const [constitutionLoading, setConstitutionLoading] = useState(true);
    const [constitutionOpen, setConstitutionOpen] = useState(false);
    const constitutionRef = useRef(null);

    // Reason types — fetched from DB
    const [reasonOptions, setReasonOptions] = useState([]);
    const [reasonLoading, setReasonLoading] = useState(true);
    const [reasonOpen, setReasonOpen] = useState(false);
    const reasonRef = useRef(null);

    // Registration types — fetched from DB
    const [regTypeOptions, setRegTypeOptions] = useState([]);
    const [regTypeLoading, setRegTypeLoading] = useState(true);
    const [regTypeOpen, setRegTypeOpen] = useState(false);
    const regTypeRef = useRef(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Fetch constitution types from backend on mount
    useEffect(() => {
        const fetchConstitutionTypes = async () => {
            try {
                const res = await api.get('/registration/master-constitution-types');
                if (res.data.success && res.data.data.length > 0) {
                    setConstitutionOptions(res.data.data);
                }
            } catch (err) {
                console.error('Failed to load constitution types:', err);
            } finally {
                setConstitutionLoading(false);
            }
        };
        fetchConstitutionTypes();
    }, []);

    // Fetch reason types from backend on mount
    useEffect(() => {
        const fetchReasonTypes = async () => {
            try {
                const res = await api.get('/registration/master-reason-types');
                if (res.data.success && res.data.data.length > 0) {
                    setReasonOptions(res.data.data);
                }
            } catch (err) {
                console.error('Failed to load reason types:', err);
            } finally {
                setReasonLoading(false);
            }
        };
        fetchReasonTypes();
    }, []);

    // Fetch registration types from backend on mount
    useEffect(() => {
        const fetchRegistrationTypes = async () => {
            try {
                const res = await api.get('/registration/master-registration-types');
                if (res.data.success && res.data.data.length > 0) {
                    setRegTypeOptions(res.data.data);
                }
            } catch (err) {
                console.error('Failed to load registration types:', err);
            } finally {
                setRegTypeLoading(false);
            }
        };
        fetchRegistrationTypes();
    }, []);

    // Close constitution dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (constitutionRef.current && !constitutionRef.current.contains(e.target)) {
                setConstitutionOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close reason dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (reasonRef.current && !reasonRef.current.contains(e.target)) {
                setReasonOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close regType dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (regTypeRef.current && !regTypeRef.current.contains(e.target)) {
                setRegTypeOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load saved data into React state when returned from backend
    useEffect(() => {
        if (loadedData && Object.keys(loadedData).length > 0) {
            setFormData(prev => ({
                ...prev,
                tradeName: loadedData.tradeName || prev.tradeName,
                additionalTrade: loadedData.additionalTrade || prev.additionalTrade,
                constitution: loadedData.constitution || prev.constitution,
                district: loadedData.district || prev.district,
                casualTaxable: loadedData.casualTaxable ?? prev.casualTaxable,
                composition: loadedData.composition ?? prev.composition,
                rule14A: loadedData.rule14A || prev.rule14A,
                reason: loadedData.reason || prev.reason,
                commencementDate: loadedData.commencementDate || prev.commencementDate,
                liabilityDate: loadedData.liabilityDate || prev.liabilityDate,
                regType: loadedData.regType || prev.regType,
                regNo: loadedData.regNo || prev.regNo,
                regDate: loadedData.regDate || prev.regDate,
            }));
        }
    }, [loadedData]);

    const toggleSwitch = (field) => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const [saving, setSaving] = useState(false);

    // Validate mandatory fields and save to database on success
    const handleSaveAndContinue = async () => {
        // ── Validation ─────────────────────────────────────────
        if (!formData.constitution) {
            toast.error('Please select Constitution of Business.');
            return;
        }
        if (!formData.district) {
            toast.error('Please select or enter a District.');
            return;
        }
        if (!formData.rule14A) {
            toast.error('Please select an option for Rule 14A registration.');
            return;
        }
        if (!formData.reason) {
            toast.error('Please select a Reason to obtain registration.');
            return;
        }
        if (!formData.commencementDate) {
            toast.error('Please enter the Date of commencement of Business.');
            return;
        }
        if (!formData.liabilityDate) {
            toast.error('Please enter the Date on which liability to register arises.');
            return;
        }

        // ── Save to DB ──────────────────────────────────────────
        setSaving(true);
        const trn = localStorage.getItem('gst_trn') || '';

        try {
            const response = await api.post('/business-details/save', {
                trn,
                legalName,
                pan,
                stateName,
                tradeName: formData.tradeName,
                additionalTrade: formData.additionalTrade,
                constitution: formData.constitution,
                district: formData.district,
                casualTaxable: formData.casualTaxable,
                composition: formData.composition,
                rule14A: formData.rule14A,
                reason: formData.reason,
                commencementDate: formData.commencementDate,
                liabilityDate: formData.liabilityDate,
            });

            if (response.data.success) {
                // Also save 'every detail' via the generic hook
                await saveAllDetails(null, formData);

                // Mark Business Details (index 0) as saved — tab turns green ✓
                localStorage.setItem('gst_tab_progress', '1');
                toast.success('Business Details saved successfully!');
                setTimeout(() => navigate('/promoter-partners'), 800);
            } else {
                toast.error(response.data.message || 'Failed to save. Please try again.');
            }
        } catch (err) {
            console.error('Save error:', err);
            toast.error(err.response?.data?.message || 'Server error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        {
            label: 'Business\nDetails', active: true,
            icon: <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="7" y="15" width="26" height="18" rx="2" />
                <path d="M14 15v-3a2 2 0 012-2h8a2 2 0 012 2v3" />
                <line x1="7" y1="24" x2="33" y2="24" />
                <line x1="20" y1="20" x2="20" y2="28" />
            </svg>
        },
        {
            label: 'Promoter /\nPartners',
            icon: <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="14" cy="13" r="5" />
                <path d="M4 33c0-6 4-10 10-10" />
                <circle cx="26" cy="13" r="5" />
                <path d="M26 23c6 0 10 4 10 10" />
            </svg>
        },
        {
            label: 'Authorized\nSignatory',
            icon: <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="16" cy="13" r="5" />
                <path d="M6 33c0-6 4-10 10-10h2" />
                <path d="M27 22l7-7 3 3-7 7z" strokeLinejoin="round" />
                <path d="M25 36h8" strokeLinecap="round" />
                <path d="M33 29l2 7" strokeLinecap="round" />
            </svg>
        },
        {
            label: 'Authorized\nRepresentative',
            icon: <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="15" cy="12" r="5" />
                <path d="M5 32c0-6 4-9 10-9" />
                <rect x="24" y="18" width="12" height="16" rx="2" />
                <line x1="27" y1="23" x2="33" y2="23" />
                <line x1="27" y1="27" x2="33" y2="27" />
                <line x1="27" y1="31" x2="31" y2="31" />
            </svg>
        },
        {
            label: 'Principal Place\nof Business',
            icon: <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 5c-5.5 0-10 4.5-10 10 0 8 10 20 10 20S30 23 30 15c0-5.5-4.5-10-10-10z" />
                <circle cx="20" cy="15" r="3.5" />
            </svg>
        },
        {
            label: 'Additional\nPlaces of\nBusiness',
            icon: <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M13 4c-4 0-7 3-7 7 0 5.5 7 14 7 14S20 16.5 20 11c0-4-3-7-7-7z" />
                <circle cx="13" cy="11" r="2.5" />
                <path d="M27 11c-3 0-5 2.5-5 5 0 4.5 5 11 5 11s5-6.5 5-11c0-2.5-2-5-5-5z" />
                <circle cx="27" cy="16" r="2" />
            </svg>
        },
        {
            label: 'Goods and\nServices',
            icon: <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 6h-8a2 2 0 00-2 2v8l14 14a2 2 0 002.8 0l7.2-7.2a2 2 0 000-2.8L20 6z" />
                <circle cx="14" cy="14" r="1.8" fill="currentColor" stroke="none" />
            </svg>
        },
        {
            label: 'State Specific\nInformation',
            icon: <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="6" y="5" width="28" height="30" rx="2" />
                <line x1="6" y1="14" x2="34" y2="14" />
                <line x1="6" y1="22" x2="34" y2="22" />
                <line x1="6" y1="30" x2="34" y2="30" />
                <line x1="18" y1="5" x2="18" y2="35" />
            </svg>
        },
        {
            label: 'Aadhaar\nAuthentication',
            icon: <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 30c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                <path d="M8 24c0-6.6 5.4-12 12-12s12 5.4 12 12" />
                <path d="M4 20C4 11.2 11.2 4 20 4s16 7.2 16 16" />
                <line x1="20" y1="22" x2="20" y2="36" />
            </svg>
        },
        {
            label: 'Verification',
            icon: <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="20" cy="20" r="14" />
                <path d="M12 20l6 6 10-12" />
            </svg>
        },
    ];
    // Tab 0 is Business Details (activeIndex = 0); read progress for completed styling
    const tabProgress = parseInt(localStorage.getItem('gst_tab_progress') || '0', 10);
    let completedTabs = [];
    try {
        completedTabs = JSON.parse(localStorage.getItem('gst_completed_tabs') || '[]');
    } catch (e) { }

    const getTabClass = (i) => {
        if (i === 0) return 'bd-tab active'; // always current on this page
        if (completedTabs.includes(i)) return 'bd-tab completed';
        if (i < tabProgress) return 'bd-tab completed';
        return 'bd-tab';
    };


    return (
        <div className="bd-page" onClick={() => setActiveMenu(null)}>
            <Toaster position="top-right" />
            {/* Page Navigation Bar */}
            <div className="bd-navbar" onClick={(e) => e.stopPropagation()}>
                <div className="bd-nav-tab active" onClick={() => navigate('/')}>Home</div>

                <div className={`bd-nav-tab ${activeMenu === 'services' ? 'active-link' : ''}`} onClick={() => setActiveMenu(p => p === 'services' ? null : 'services')}>
                    Services ▼
                </div>

                <div className="bd-nav-tab">GST Law</div>

                <div className={`bd-nav-tab ${activeMenu === 'downloads' ? 'active-link' : ''}`} onClick={() => setActiveMenu(p => p === 'downloads' ? null : 'downloads')}>
                    Downloads ▼
                </div>

                <div className={`bd-nav-tab ${activeMenu === 'search' ? 'active-link' : ''}`} onClick={() => setActiveMenu(p => p === 'search' ? null : 'search')}>
                    Search Taxpayer ▼
                </div>

                <div className="bd-nav-tab">Help and Taxpayer Facilities</div>
                <div className="bd-nav-tab">e-Invoice</div>
                <div className="bd-nav-tab">News and Updates</div>
            </div>

            {/* Sub-menu dropdowns */}
            {activeMenu && SUB_MENUS[activeMenu] && (
                <div className="bd-sub-navbar">
                    {SUB_MENUS[activeMenu].map((item) => (
                        <Link
                            key={item.label}
                            to={item.to}
                            className="bd-sub-nav-link"
                            onClick={() => setActiveMenu(null)}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}

            {/* Breadcrumb */}
            <div className="bd-breadcrumb">
                <div>
                    <span className="bd-bc-link" onClick={() => navigate('/')}>Home</span>
                    <span className="bd-bc-sep"> &gt; </span>
                    <span className="bd-bc-active">Business Details</span>
                </div>
                <span className="bd-lang">🌐 English</span>
            </div>

            {/* Centred content area — narrows layout to match portal */}
            <div className="bd-content-area">
                {/* Alert Banner */}
                <div className="bd-alert">
                    <span className="bd-alert-text">
                        Please complete Aadhaar OTP authentication on the GST portal.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        Please complete Aadhaar OTP authentication on the GST portal.
                    </span>
                </div>

                {/* Application Summary */}
                <div className="bd-summary">
                    <div className="bd-summary-item">
                        <div className="bd-s-label">Application Type</div>
                        <div className="bd-s-value">New Registration</div>
                    </div>
                    <div className="bd-summary-item">
                        <div className="bd-s-label">Due Date to Complete</div>
                        <div className="bd-s-value">{expiryDate}</div>
                    </div>
                    <div className="bd-summary-item">
                        <div className="bd-s-label">Last Modified</div>
                        <div className="bd-s-value">{lastModified}</div>
                    </div>
                    <div className="bd-summary-item">
                        <div className="bd-s-label">Profile</div>
                        <div className="bd-s-value">0%</div>
                    </div>
                </div>

                {/* Icon Tabs */}
                <div className="bd-tabs-wrapper">
                    <div className="bd-tabs">
                        {tabs.map((tab, i) => (
                            <div
                                key={i}
                                className={getTabClass(i)}
                                title={tab.label.replace(/\n/g, ' ')}
                                onClick={() => {
                                    if (tabProgress === 0 && i !== 0) {
                                        toast.error("Please Save & Continue your Business Details first!");
                                        return;
                                    }
                                    navigate(TABS[i].path);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="bd-tab-icon">{tab.icon}</div>
                                <div className="bd-tab-label">{tab.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="bd-form-wrapper">
                    <div className="bd-mandatory-note">
                        <span className="red-dot">●</span> Indicates mandatory fields
                    </div>

                    <h2 className="bd-section-title">Details of your Business</h2>

                    {/* Legal Name / PAN / PAN Date row */}
                    <div className="bd-info-grid">
                        <div className="bd-info-item">
                            <div className="bd-info-label">Legal Name of the Business</div>
                            <div className="bd-info-value">{legalName}</div>
                        </div>
                        <div className="bd-info-item">
                            <div className="bd-info-label">Permanent Account Number (PAN)</div>
                            <div className="bd-info-value">{pan}</div>
                        </div>
                        <div className="bd-info-item">
                            <div className="bd-info-label">Date of Creation of PAN</div>
                            <div className="bd-info-value muted">Pan date not available</div>
                        </div>
                    </div>

                    <div className="bd-form-divider" />

                    {/* Trade Name & Constitution */}
                    <div className="bd-form-row">
                        <div className="bd-form-group">
                            <label className="bd-label">Trade Name</label>
                            <input type="text" name="tradeName" className="bd-input"
                                placeholder="Enter Trade Name"
                                value={formData.tradeName} onChange={handleChange} />
                        </div>
                        <div className="bd-form-group" ref={constitutionRef} style={{ position: 'relative' }}>
                            <label className="bd-label">Constitution of Business (Select Appropriate) <span className="red-dot">*</span></label>
                            {/* Custom dropdown trigger */}
                            <div
                                className={`bd-custom-select${constitutionOpen ? ' open' : ''}${constitutionLoading ? ' disabled' : ''}`}
                                onClick={() => !constitutionLoading && setConstitutionOpen(o => !o)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !constitutionLoading && setConstitutionOpen(o => !o); }
                                    if (e.key === 'Escape') setConstitutionOpen(false);
                                }}
                                aria-haspopup="listbox"
                                aria-expanded={constitutionOpen}
                            >
                                <span className={formData.constitution ? 'bd-cs-value selected' : 'bd-cs-value placeholder'}>
                                    {constitutionLoading ? 'Loading...' : (formData.constitution || 'Select')}
                                </span>
                                <span className="bd-cs-arrow">{constitutionOpen ? '▲' : '▼'}</span>
                            </div>
                            {/* Options list rendered below the box */}
                            {constitutionOpen && (
                                <div className="bd-custom-options" role="listbox">
                                    <div
                                        className="bd-custom-option"
                                        role="option"
                                        onClick={() => { setFormData(prev => ({ ...prev, constitution: '' })); setConstitutionOpen(false); }}
                                    >
                                        Select
                                    </div>
                                    {constitutionOptions.map(o => (
                                        <div
                                            key={o}
                                            className={`bd-custom-option${formData.constitution === o ? ' active' : ''}`}
                                            role="option"
                                            aria-selected={formData.constitution === o}
                                            onClick={() => { setFormData(prev => ({ ...prev, constitution: o })); setConstitutionOpen(false); }}
                                        >
                                            {o}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Trade Name */}
                    <div className="bd-form-group" style={{ maxWidth: '400px' }}>
                        <label className="bd-label">Additional Trade Name</label>
                        <div className="bd-input-btn-row">
                            <input type="text" name="additionalTrade" className="bd-input"
                                placeholder="Enter Trade Name"
                                value={formData.additionalTrade} onChange={handleChange} />
                            <button className="bd-btn-add">+ ADD</button>
                            <button className="bd-btn-cancel">✕ CANCEL</button>
                        </div>
                    </div>

                    <div className="bd-form-divider" />

                    {/* State / District */}
                    <div className="bd-form-row">
                        <div className="bd-form-group">
                            <label className="bd-label">Name of the State</label>
                            <div className="bd-static-value">{stateName}</div>
                        </div>
                        <div className="bd-form-group">
                            <label className="bd-label">District <span className="red-dot">*</span></label>
                            <input
                                type="text"
                                name="district"
                                className="bd-input"
                                placeholder="Enter District"
                                value={formData.district}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="bd-form-divider" />

                    {/* Casual Taxable Toggle */}
                    <div className="bd-toggle-group">
                        <label className="bd-label">
                            Are you applying for registration as a casual taxable person?
                            <span className="bd-info-icon"> ⓘ</span>
                        </label>
                        <div className={`bd-toggle ${formData.casualTaxable ? 'on' : ''}`}
                            onClick={() => toggleSwitch('casualTaxable')}>
                            <div className="bd-toggle-knob" />
                        </div>
                        <span className="bd-toggle-label">{formData.casualTaxable ? 'Yes' : 'No'}</span>
                    </div>

                    {/* Composition Toggle */}
                    <div className="bd-toggle-group">
                        <label className="bd-label">
                            Option For Composition
                            <span className="bd-info-icon"> ⓘ</span>
                        </label>
                        <div className={`bd-toggle ${formData.composition ? 'on' : ''}`}
                            onClick={() => toggleSwitch('composition')}>
                            <div className="bd-toggle-knob" />
                        </div>
                        <span className="bd-toggle-label">{formData.composition ? 'Yes' : 'No'}</span>
                    </div>

                    <div className="bd-form-divider" />

                    {/* Rule 14A */}
                    <div className="bd-form-group">
                        <label className="bd-label">Option for registration under Rule 14A <span className="red-dot">*</span></label>
                        <div className="bd-radio-row">
                            <label className="bd-radio-label">
                                <input type="radio" name="rule14A" value="Yes"
                                    checked={formData.rule14A === 'Yes'} onChange={handleChange} /> Yes
                            </label>
                            <label className="bd-radio-label">
                                <input type="radio" name="rule14A" value="No"
                                    checked={formData.rule14A === 'No'} onChange={handleChange} /> No
                            </label>
                        </div>
                        <p className="bd-hint">
                            ⓘ You may avail option under Rule 14A if the ITC to be passed on is less than or equal to 2.5 lakhs per month,
                            otherwise please click on <strong>'No'</strong>. Further, to avail said option, Aadhaar Authentication is mandatory.
                            Please note that by filing this application under Rule 14A, you are also declaring that the aforesaid business shall
                            abide by the conditions and restrictions specified in the Act or the rules for opting to register under rule 14A.
                        </p>
                    </div>

                    {/* Reason / Dates */}
                    <div className="bd-form-row three-col">
                        <div className="bd-form-group" ref={reasonRef} style={{ position: 'relative' }}>
                            <label className="bd-label">Reason to obtain registration <span className="red-dot">*</span></label>
                            {/* Custom dropdown trigger */}
                            <div
                                className={`bd-custom-select${reasonOpen ? ' open' : ''}${reasonLoading ? ' disabled' : ''}`}
                                onClick={() => !reasonLoading && setReasonOpen(o => !o)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !reasonLoading && setReasonOpen(o => !o); }
                                    if (e.key === 'Escape') setReasonOpen(false);
                                }}
                                aria-haspopup="listbox"
                                aria-expanded={reasonOpen}
                            >
                                <span className={formData.reason ? 'bd-cs-value selected' : 'bd-cs-value placeholder'}>
                                    {reasonLoading ? 'Loading...' : (formData.reason || 'Select')}
                                </span>
                                <span className="bd-cs-arrow">{reasonOpen ? '▲' : '▼'}</span>
                            </div>
                            {/* Options list rendered below the box */}
                            {reasonOpen && (
                                <div className="bd-custom-options" role="listbox">
                                    <div
                                        className="bd-custom-option"
                                        role="option"
                                        onClick={() => { setFormData(prev => ({ ...prev, reason: '' })); setReasonOpen(false); }}
                                    >
                                        Select
                                    </div>
                                    {reasonOptions.map(o => (
                                        <div
                                            key={o}
                                            className={`bd-custom-option${formData.reason === o ? ' active' : ''}`}
                                            role="option"
                                            aria-selected={formData.reason === o}
                                            onClick={() => { setFormData(prev => ({ ...prev, reason: o })); setReasonOpen(false); }}
                                        >
                                            {o}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="bd-form-group">
                            <label className="bd-label">Date of commencement of Business <span className="red-dot">*</span></label>
                            <div className="bd-date-row">
                                <span className="bd-from-tag">From</span>
                                <input type="date" name="commencementDate" className="bd-input bd-date-input"
                                    value={formData.commencementDate} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="bd-form-group">
                            <label className="bd-label">Date on which liability to register arises <span className="red-dot">*</span></label>
                            <div className="bd-date-row">
                                <input type="date" name="liabilityDate" className="bd-input bd-date-input"
                                    value={formData.liabilityDate} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Indicate Existing Registrations */}
                    <h3 className="bd-subsection-title">Indicate Existing Registrations</h3>
                    <div className="bd-form-row">
                        <div className="bd-form-group" ref={regTypeRef} style={{ position: 'relative' }}>
                            <label className="bd-label">Type of Registration</label>
                            {/* Custom dropdown trigger */}
                            <div
                                className={`bd-custom-select${regTypeOpen ? ' open' : ''}${regTypeLoading ? ' disabled' : ''}`}
                                onClick={() => !regTypeLoading && setRegTypeOpen(o => !o)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !regTypeLoading && setRegTypeOpen(o => !o); }
                                    if (e.key === 'Escape') setRegTypeOpen(false);
                                }}
                                aria-haspopup="listbox"
                                aria-expanded={regTypeOpen}
                            >
                                <span className={formData.regType ? 'bd-cs-value selected' : 'bd-cs-value placeholder'}>
                                    {regTypeLoading ? 'Loading...' : (formData.regType || 'Select')}
                                </span>
                                <span className="bd-cs-arrow">{regTypeOpen ? '▲' : '▼'}</span>
                            </div>
                            {/* Options list rendered below the box */}
                            {regTypeOpen && (
                                <div className="bd-custom-options" role="listbox">
                                    <div
                                        className="bd-custom-option"
                                        role="option"
                                        onClick={() => { setFormData(prev => ({ ...prev, regType: '' })); setRegTypeOpen(false); }}
                                    >
                                        Select
                                    </div>
                                    {regTypeOptions.map(o => (
                                        <div
                                            key={o}
                                            className={`bd-custom-option${formData.regType === o ? ' active' : ''}`}
                                            role="option"
                                            aria-selected={formData.regType === o}
                                            onClick={() => { setFormData(prev => ({ ...prev, regType: o })); setRegTypeOpen(false); }}
                                        >
                                            {o}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="bd-form-group">
                            <label className="bd-label">Registration No. <span className="red-dot">*</span></label>
                            <input type="text" name="regNo" className="bd-input"
                                value={formData.regNo} onChange={handleChange} />
                        </div>
                        <div className="bd-form-group">
                            <label className="bd-label">Date of Registration <span className="red-dot">*</span></label>
                            <div className="bd-date-row">
                                <input type="date" name="regDate" className="bd-input bd-date-input"
                                    value={formData.regDate} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="bd-form-group bd-align-end">
                            <button className="bd-btn-add">+ ADD</button>
                            <button className="bd-btn-cancel">✕ CANCEL</button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bd-actions">
                        <button className="bd-back-btn" onClick={() => navigate('/')}>BACK</button>
                        <button
                            className="bd-save-btn"
                            onClick={handleSaveAndContinue}
                            disabled={saving}
                            style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                        >
                            {saving ? 'SAVING...' : 'SAVE & CONTINUE'}
                        </button>
                    </div>
                </div>
            </div>{/* end bd-content-area */}

            {/* Footer */}
            <div className="bd-footer">
                <div>© 2025-26 Goods and Services Tax Network</div>
                <div>Site Last Updated on 30-01-2026</div>
                <div>Designed &amp; Developed by GSTN</div>
            </div>
            <div className="bd-footer-sub">
                Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
            </div>
        </div>
    );
};

export default BusinessDetails;
