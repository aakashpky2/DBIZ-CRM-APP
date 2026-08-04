import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import './Dashboard.css';
import './GSTR1Dashboard.css';
import './GSTR1B2BDashboard.css';

const GSTR1ECOAmendmentSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine active tab based on route
    const [activeTab, setActiveTab] = useState(
        location.pathname.includes('/lipaysum') ? 'sec95' : 'tcs'
    );

    useEffect(() => {
        if (location.pathname.includes('/lipaysum')) {
            setActiveTab('sec95');
        } else {
            setActiveTab('tcs');
        }
    }, [location]);

    const [financialYear, setFinancialYear] = useState('2026-27');
    const [period, setPeriod] = useState('May');
    const [gstin, setGstin] = useState('');
    
    const [errorYear, setErrorYear] = useState('');
    const [errorPeriod, setErrorPeriod] = useState('');
    const [errorGstin, setErrorGstin] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [savedRecords, setSavedRecords] = useState([]);

    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await api.get(`/forms/tab/${trn}/GSTR1_ECO_Invoices`);
                
                if (res.data.success && res.data.data) {
                    const records = Array.isArray(res.data.data.records) ? res.data.data.records : (Array.isArray(res.data.data) ? res.data.data : []);
                    setSavedRecords(records);
                }
            } catch (error) {
                console.error("Failed to fetch ECO records", error);
            }
        };
        fetchRecords();
    }, []);

    const validateGSTIN = (val) => {
        if (!val) return 'Required';
        if (val.length !== 15) return 'Invalid GSTIN Format';
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstinRegex.test(val)) return 'Invalid GSTIN Format';
        return '';
    };

    const handleAmend = async () => {
        let hasError = false;
        
        if (!financialYear) { setErrorYear('Required'); hasError = true; } else { setErrorYear(''); }
        if (!period) { setErrorPeriod('Required'); hasError = true; } else { setErrorPeriod(''); }
        
        const gstinValidation = validateGSTIN(gstin.trim());
        if (gstinValidation) { setErrorGstin(gstinValidation); hasError = true; } else { setErrorGstin(''); }

        if (hasError) return;
        
        setLoading(true);
        try {
            // Find the matching record
            const foundRecord = savedRecords.find(rec => rec.gstin === gstin.trim());

            if (foundRecord) {
                toast.success('Record found! Navigating to amend details...');
                navigate('/returns/auth/gstr1/ecomaopt/amendment/details', { state: { record: foundRecord, year: financialYear, period, tab: activeTab } });
            } else {
                toast.error('No matching E-Commerce Operator record found.');
            }
        } catch (error) {
            console.error("Failed to search record", error);
            toast.error('Error searching for record.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        // Simulate data reload
        const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
        try {
            const res = await api.get(`/forms/tab/${trn}/GSTR1_ECO_Invoices`);
            if (res.data.success && res.data.data) {
                const records = Array.isArray(res.data.data.records) ? res.data.data.records : (Array.isArray(res.data.data) ? res.data.data : []);
                setSavedRecords(records);
            }
        } catch(e) {}
        setLoading(false);
    };

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Toaster position="top-right" />
            <PageLoader loading={loading} />
            
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#3b82f6' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>Amended Supplies through ECO</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="gstr1-main-content" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: '1' }}>
                
                {/* Cyan Header Banner */}
                <div className="b2b-header-banner" style={{ backgroundColor: '#14b8a6', padding: '10px 15px', color: '#fff', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>14A - Amended Supplies made through E-Commerce Operators</h2>
                    <div className="gstr1-header-actions" style={{ display: 'flex', gap: '10px' }}>
                        <button className="gstr1-btn-secondary" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            HELP <span style={{ fontSize: '11px', border: '1px solid #fff', borderRadius: '50%', padding: '0 4px' }}>?</span>
                        </button>
                        <button className="gstr1-btn-icon" style={{ backgroundColor: '#2b4b7c', border: '1px solid #1b2e4b', color: 'white', padding: '4px 8px', cursor: 'pointer', borderRadius: '3px' }} onClick={handleRefresh}>↻</button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', backgroundColor: '#14b8a6', paddingLeft: '20px' }}>
                    <div 
                        onClick={() => navigate('/returns/auth/gstr1/ecomaopt/amendment/summary')}
                        style={{ 
                            padding: '10px 20px', 
                            color: activeTab === 'tcs' ? '#14b8a6' : '#fff', 
                            backgroundColor: activeTab === 'tcs' ? '#f1f3f6' : 'transparent',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px',
                            borderTop: activeTab === 'tcs' ? '3px solid #14b8a6' : '3px solid transparent'
                        }}
                    >
                        Liable to collect tax u/s 52 (TCS)
                    </div>
                    <div 
                        onClick={() => navigate('/returns/auth/gstr1/ecomaopt/lipaysum')}
                        style={{ 
                            padding: '10px 20px', 
                            color: activeTab === 'sec95' ? '#14b8a6' : '#fff', 
                            backgroundColor: activeTab === 'sec95' ? '#f1f3f6' : 'transparent',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px',
                            borderTop: activeTab === 'sec95' ? '3px solid #14b8a6' : '3px solid transparent'
                        }}
                    >
                        Liable to pay tax u/s 9(5)
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '20px', border: '1px solid #e5e7eb', borderTop: 'none' }}>
                    {/* Light Blue Notification Box */}
                    <div style={{ backgroundColor: '#e0f2fe', padding: '15px', color: '#0369a1', fontSize: '14px', border: '1px solid #bae6fd' }}>
                        There are no records to be displayed.
                    </div>

                    {/* Mandatory Fields Indicator */}
                    <div style={{ textAlign: 'right', marginTop: '15px', fontSize: '12px', color: '#4b5563' }}>
                        <span style={{ color: 'red', marginRight: '4px' }}>●</span>
                        Indicates Mandatory Fields
                    </div>

                    {/* Form Area */}
                    <div style={{ marginTop: '10px', display: 'flex', gap: '30px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <label style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                                Financial Year <span style={{ color: 'red' }}>*</span>
                            </label>
                            <select 
                                value={financialYear}
                                onChange={(e) => {
                                    setFinancialYear(e.target.value);
                                    if (errorYear) setErrorYear('');
                                }}
                                style={{ padding: '8px', border: errorYear ? '1px solid red' : '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                            >
                                <option value="2026-27">2026-27</option>
                                <option value="2025-26">2025-26</option>
                                <option value="2024-25">2024-25</option>
                            </select>
                            {errorYear && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errorYear}</span>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <label style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                                Month/Quarter <span style={{ color: 'red' }}>*</span>
                            </label>
                            <select 
                                value={period}
                                onChange={(e) => {
                                    setPeriod(e.target.value);
                                    if (errorPeriod) setErrorPeriod('');
                                }}
                                style={{ padding: '8px', border: errorPeriod ? '1px solid red' : '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                            >
                                {months.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            {errorPeriod && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errorPeriod}</span>}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <label style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                                GSTIN of e-commerce operator <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input 
                                type="text" 
                                value={gstin}
                                onChange={(e) => {
                                    setGstin(e.target.value.toUpperCase());
                                    if (errorGstin) setErrorGstin('');
                                }}
                                maxLength={15}
                                style={{ padding: '8px', border: errorGstin ? '1px solid red' : '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', textTransform: 'uppercase' }}
                            />
                            {errorGstin && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errorGstin}</span>}
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px', gap: '10px' }}>
                        <button 
                            onClick={() => navigate('/returns/gstr1')}
                            style={{ padding: '8px 20px', backgroundColor: '#fff', border: '1px solid #374151', color: '#374151', cursor: 'pointer', fontWeight: '500' }}
                        >
                            BACK
                        </button>
                        <button 
                            onClick={handleAmend}
                            style={{ padding: '8px 20px', backgroundColor: '#2b4b7c', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: '500' }}
                        >
                            AMEND RECORD
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            {/* Footer Bar */}
            <footer className="dashboard-footer-bar" style={{ marginTop: 'auto' }}>
                <div className="footer-left">© 2026-27 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 03-05-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>

            <div className="bottom-info-blue-bar">
                Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
            </div>
        </div>
    );
};

export default GSTR1ECOAmendmentSummary;
