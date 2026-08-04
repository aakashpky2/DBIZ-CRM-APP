import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import './Dashboard.css';
import './GSTR1Dashboard.css';
import './GSTR1B2BDashboard.css';

const GSTR1Supplies15AAmendmentSummary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determine active tab based on route
    const [activeTab, setActiveTab] = useState(() => {
        if (location.pathname.includes('/b2ca_sum')) return 'regToUnreg';
        if (location.pathname.includes('/c2ba_sum')) return 'unregToReg';
        if (location.pathname.includes('/c2ca_sum')) return 'unregToUnreg';
        return 'regToReg';
    });

    useEffect(() => {
        if (location.pathname.includes('/b2ca_sum')) {
            setActiveTab('regToUnreg');
        } else if (location.pathname.includes('/c2ba_sum')) {
            setActiveTab('unregToReg');
        } else if (location.pathname.includes('/c2ca_sum')) {
            setActiveTab('unregToUnreg');
        } else {
            setActiveTab('regToReg');
        }
    }, [location]);

    // Form 1 State
    const [financialYear, setFinancialYear] = useState('2026-27');
    const [documentNo, setDocumentNo] = useState('');
    
    // Form 2 State (Registered to Unregistered)
    const [month, setMonth] = useState('May');
    const [originalPOS, setOriginalPOS] = useState('');
    const [supplierGSTIN, setSupplierGSTIN] = useState('');

    const [errorYear, setErrorYear] = useState('');
    const [errorDocumentNo, setErrorDocumentNo] = useState('');
    const [errorMonth, setErrorMonth] = useState('');
    const [errorPOS, setErrorPOS] = useState('');
    const [errorGSTIN, setErrorGSTIN] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [savedRecords, setSavedRecords] = useState([]);
    const [availablePOS, setAvailablePOS] = useState([]);

    const monthsList = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await api.get(`/forms/tab/${trn}/GSTR1_Supplies95_Invoices`);
                
                if (res.data.success && res.data.data) {
                    const records = Array.isArray(res.data.data.records) ? res.data.data.records : (Array.isArray(res.data.data) ? res.data.data : []);
                    setSavedRecords(records);
                    
                    // Extract unique POS values for tab 2
                    const posSet = new Set();
                    records.forEach(rec => {
                        if (rec.pos) posSet.add(rec.pos);
                    });
                    setAvailablePOS(Array.from(posSet).sort());
                }
            } catch (error) {
                console.error("Failed to fetch Supplies 9(5) records", error);
            }
        };
        fetchRecords();
    }, []);

    const validateGSTIN = (val) => {
        if (!val) return '';
        if (val.length !== 15) return 'Invalid GSTIN Format';
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstinRegex.test(val)) return 'Invalid GSTIN Format';
        return '';
    };

    const handleAmend = async () => {
        let hasError = false;
        
        if (!financialYear) { setErrorYear('Required'); hasError = true; } else { setErrorYear(''); }
        
        if (activeTab === 'regToReg' || activeTab === 'unregToReg') {
            if (!documentNo.trim()) { setErrorDocumentNo('Required'); hasError = true; } else { setErrorDocumentNo(''); }
        } else if (activeTab === 'regToUnreg' || activeTab === 'unregToUnreg') {
            if (!month) { setErrorMonth('Required'); hasError = true; } else { setErrorMonth(''); }
            if (!originalPOS) { setErrorPOS('Required'); hasError = true; } else { setErrorPOS(''); }
            if (activeTab === 'regToUnreg') {
                if (!supplierGSTIN.trim()) { setErrorGSTIN('Required'); hasError = true; } 
                else {
                    const gstinValidation = validateGSTIN(supplierGSTIN.trim());
                    if (gstinValidation) { setErrorGSTIN(gstinValidation); hasError = true; }
                    else { setErrorGSTIN(''); }
                }
            }
        }
        
        if (hasError) return;
        
        setLoading(true);
        try {
            let foundRecord;
            if (activeTab === 'regToReg' || activeTab === 'unregToReg') {
                foundRecord = savedRecords.find(rec => (rec.documentNo || rec.invoiceNo) === documentNo.trim());
            } else if (activeTab === 'regToUnreg') {
                foundRecord = savedRecords.find(rec => rec.pos === originalPOS && rec.supplierGstin === supplierGSTIN.trim());
                // Fallback basic match if structure is different
                if (!foundRecord) foundRecord = savedRecords.find(rec => rec.pos === originalPOS);
            } else if (activeTab === 'unregToUnreg') {
                foundRecord = savedRecords.find(rec => rec.pos === originalPOS);
            }

            if (foundRecord) {
                toast.success('Record found! Navigating to amend details...');
                navigate('/returns/auth/gstr1/sup15a/amendment/details', { state: { record: foundRecord, year: financialYear, tab: activeTab, month } });
            } else {
                toast.error(`No matching ${activeTab === 'unregToUnreg' ? 'Unregistered to Unregistered' : activeTab === 'unregToReg' ? 'Unregistered to Registered' : activeTab === 'regToUnreg' ? 'Registered to Unregistered' : 'amended supply'} record found.`);
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
            const res = await api.get(`/forms/tab/${trn}/GSTR1_Supplies95_Invoices`);
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
                    <span style={{ color: '#4b5563' }}>Amended Supplies U/s 9(5)</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="gstr1-main-content" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: '1' }}>
                
                {/* Cyan Header Banner */}
                <div className="b2b-header-banner" style={{ backgroundColor: '#14b8a6', padding: '10px 15px', color: '#fff', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>15A- Amended Supplies U/s 9(5)</h2>
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
                        onClick={() => navigate('/returns/auth/gstr1/sup15a/summary')}
                        style={{ 
                            padding: '10px 20px', 
                            color: activeTab === 'regToReg' ? '#14b8a6' : '#fff', 
                            backgroundColor: activeTab === 'regToReg' ? '#f1f3f6' : 'transparent',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px',
                            borderTop: activeTab === 'regToReg' ? '3px solid #14b8a6' : '3px solid transparent'
                        }}
                    >
                        Registered to Registered
                    </div>
                    <div 
                        onClick={() => navigate('/returns/auth/gstr1/sup15a/b2ca_sum')}
                        style={{ 
                            padding: '10px 20px', 
                            color: activeTab === 'regToUnreg' ? '#14b8a6' : '#fff', 
                            backgroundColor: activeTab === 'regToUnreg' ? '#f1f3f6' : 'transparent',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px',
                            borderTop: activeTab === 'regToUnreg' ? '3px solid #14b8a6' : '3px solid transparent'
                        }}
                    >
                        Registered to Unregistered
                    </div>
                    <div 
                        onClick={() => navigate('/returns/auth/gstr1/sup15a/c2ba_sum')}
                        style={{ 
                            padding: '10px 20px', 
                            color: activeTab === 'unregToReg' ? '#14b8a6' : '#fff', 
                            backgroundColor: activeTab === 'unregToReg' ? '#f1f3f6' : 'transparent',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px',
                            borderTop: activeTab === 'unregToReg' ? '3px solid #14b8a6' : '3px solid transparent'
                        }}
                    >
                        Unregistered to Registered
                    </div>
                    <div 
                        onClick={() => navigate('/returns/auth/gstr1/sup15a/c2ca_sum')}
                        style={{ 
                            padding: '10px 20px', 
                            color: activeTab === 'unregToUnreg' ? '#14b8a6' : '#fff', 
                            backgroundColor: activeTab === 'unregToUnreg' ? '#f1f3f6' : 'transparent',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px',
                            borderTop: activeTab === 'unregToUnreg' ? '3px solid #14b8a6' : '3px solid transparent'
                        }}
                    >
                        Unregistered to Unregistered
                    </div>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '20px', border: '1px solid #e5e7eb', borderTop: 'none' }}>
                    {/* Light Blue Notification Box */}
                    <div style={{ backgroundColor: '#e0f2fe', padding: '15px', color: '#0369a1', fontSize: '14px', border: '1px solid #bae6fd' }}>
                        There are no records to be displayed.
                    </div>

                    {(activeTab === 'regToUnreg' || activeTab === 'unregToUnreg') && (
                        <div style={{ backgroundColor: '#e0f2fe', padding: '15px', marginTop: '15px', color: '#0369a1', fontSize: '14px', border: '1px solid #bae6fd' }}>
                            <div style={{ fontStyle: 'italic', marginBottom: '8px' }}>
                                To amend the POS of an already filed record (as reported in table 15 of earlier return period), you are required to use the following steps:
                            </div>
                            <ol style={{ margin: 0, paddingLeft: '20px', fontStyle: 'italic' }}>
                                <li>Search the POS which was originally reported and filed in earlier return period and save with '0' values.</li>
                                <li>Search the new POS and save the new POS after adding respective details.</li>
                            </ol>
                        </div>
                    )}

                    {/* Mandatory Fields Indicator */}
                    <div style={{ textAlign: 'right', marginTop: '15px', fontSize: '12px', color: '#4b5563' }}>
                        <span style={{ color: 'red', marginRight: '4px' }}>●</span>
                        Indicates Mandatory Fields
                    </div>

                    {/* Form Area */}
                    <div style={{ marginTop: '10px', display: 'flex', gap: '20px' }}>
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

                        {(activeTab === 'regToReg' || activeTab === 'unregToReg') && (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 2 }}>
                                <label style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                                    Document No. <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Enter Document No."
                                    value={documentNo}
                                    onChange={(e) => {
                                        setDocumentNo(e.target.value.toUpperCase());
                                        if (errorDocumentNo) setErrorDocumentNo('');
                                    }}
                                    style={{ padding: '8px', border: errorDocumentNo ? '1px solid red' : '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', textTransform: 'uppercase' }}
                                />
                                {errorDocumentNo && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errorDocumentNo}</span>}
                            </div>
                        )}

                        {(activeTab === 'regToUnreg' || activeTab === 'unregToUnreg') && (
                            <>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                                        Month <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <select 
                                        value={month}
                                        onChange={(e) => {
                                            setMonth(e.target.value);
                                            if (errorMonth) setErrorMonth('');
                                        }}
                                        style={{ padding: '8px', border: errorMonth ? '1px solid red' : '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                                    >
                                        {monthsList.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                    {errorMonth && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errorMonth}</span>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <label style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                                        Original POS <span style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            width: '14px', 
                                            height: '14px', 
                                            borderRadius: '50%', 
                                            backgroundColor: '#4b5563', 
                                            color: 'white', 
                                            fontSize: '10px', 
                                            margin: '0 2px'
                                        }}>i</span> <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <select 
                                        value={originalPOS}
                                        onChange={(e) => {
                                            setOriginalPOS(e.target.value);
                                            if (errorPOS) setErrorPOS('');
                                        }}
                                        style={{ padding: '8px', border: errorPOS ? '1px solid red' : '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px' }}
                                    >
                                        <option value="">Select</option>
                                        {availablePOS.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    {errorPOS && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errorPOS}</span>}
                                </div>
                                {activeTab === 'regToUnreg' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <label style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                                            Supplier GSTIN/UIN <span style={{ color: 'red' }}>*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Search by supplier GSTIN/UIN"
                                            value={supplierGSTIN}
                                            onChange={(e) => {
                                                setSupplierGSTIN(e.target.value.toUpperCase());
                                                if (errorGSTIN) setErrorGSTIN('');
                                            }}
                                            maxLength={15}
                                            style={{ padding: '8px', border: errorGSTIN ? '1px solid red' : '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', textTransform: 'uppercase' }}
                                        />
                                        {errorGSTIN && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errorGSTIN}</span>}
                                    </div>
                                )}
                            </>
                        )}
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

export default GSTR1Supplies15AAmendmentSummary;
