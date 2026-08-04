import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import './Dashboard.css';
import './GSTR1Dashboard.css';
import './GSTR1B2BDashboard.css';

const GSTR1AdvTaxAmendmentSummary = () => {
    const navigate = useNavigate();
    const [financialYear, setFinancialYear] = useState('2026-27');
    const [returnFilingPeriod, setReturnFilingPeriod] = useState('May');
    const [pos, setPos] = useState('');
    const [isDifferential, setIsDifferential] = useState(false);
    
    const [errorYear, setErrorYear] = useState('');
    const [errorPeriod, setErrorPeriod] = useState('');
    const [errorPOS, setErrorPOS] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [savedRecords, setSavedRecords] = useState([]);
    const [availablePOS, setAvailablePOS] = useState([]);

    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await api.get(`/forms/tab/${trn}/GSTR1_AdvTax_Invoices`);
                
                if (res.data.success && res.data.data) {
                    const records = Array.isArray(res.data.data.records) ? res.data.data.records : (Array.isArray(res.data.data) ? res.data.data : []);
                    setSavedRecords(records);
                    
                    // Extract unique POS values
                    const posSet = new Set();
                    records.forEach(rec => {
                        if (rec.pos) posSet.add(rec.pos);
                    });
                    setAvailablePOS(Array.from(posSet).sort());
                }
            } catch (error) {
                console.error("Failed to fetch Advance Tax records", error);
            }
        };
        fetchRecords();
    }, []);

    const handleAmend = async () => {
        let hasError = false;
        
        if (!financialYear) { setErrorYear('Required'); hasError = true; } else { setErrorYear(''); }
        if (!returnFilingPeriod) { setErrorPeriod('Required'); hasError = true; } else { setErrorPeriod(''); }
        if (!pos) { setErrorPOS('Required'); hasError = true; } else { setErrorPOS(''); }

        if (hasError) return;
        
        setLoading(true);
        try {
            // Find the matching record
            const foundRecord = savedRecords.find(rec => rec.pos === pos);

            if (foundRecord) {
                toast.success('Record found! Navigating to amend details...');
                navigate('/returns/auth/gstr1/advtax/amendment/details', { state: { record: foundRecord, year: financialYear, period: returnFilingPeriod, isDifferential } });
            } else {
                toast.error('No matching advance tax liability record found.');
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
            const res = await api.get(`/forms/tab/${trn}/GSTR1_AdvTax_Invoices`);
            if (res.data.success && res.data.data) {
                const records = Array.isArray(res.data.data.records) ? res.data.data.records : (Array.isArray(res.data.data) ? res.data.data : []);
                setSavedRecords(records);
                const posSet = new Set();
                records.forEach(rec => {
                    if (rec.pos) posSet.add(rec.pos);
                });
                setAvailablePOS(Array.from(posSet).sort());
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
                    <span style={{ color: '#4b5563' }}>Amended Tax Liability (Advances Received)</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="gstr1-main-content" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: '1' }}>
                
                {/* Cyan Header Banner */}
                <div className="b2b-header-banner" style={{ backgroundColor: '#14b8a6', padding: '10px 15px', color: '#fff', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>11A - Amended Tax Liability (Advances Received)</h2>
                    <div className="gstr1-header-actions" style={{ display: 'flex', gap: '10px' }}>
                        <button className="gstr1-btn-icon" style={{ backgroundColor: '#2b4b7c', border: '1px solid #1b2e4b', color: 'white', padding: '4px 8px', cursor: 'pointer', borderRadius: '3px' }} onClick={handleRefresh}>↻</button>
                    </div>
                </div>

                {/* Light Blue Notification Box */}
                <div style={{ backgroundColor: '#e0f2fe', padding: '15px', marginTop: '20px', color: '#0369a1', fontSize: '14px', border: '1px solid #bae6fd' }}>
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
                            Return Filing Period <span style={{ color: 'red' }}>*</span>
                        </label>
                        <select 
                            value={returnFilingPeriod}
                            onChange={(e) => {
                                setReturnFilingPeriod(e.target.value);
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
                            POS <span style={{ 
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
                            value={pos}
                            onChange={(e) => {
                                setPos(e.target.value);
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
                </div>

                {/* Additional Option Checkbox */}
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#f9fafb', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                    <input 
                        type="checkbox" 
                        checked={isDifferential}
                        onChange={(e) => setIsDifferential(e.target.checked)}
                        style={{ marginTop: '4px', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label style={{ fontSize: '14px', color: '#374151', lineHeight: '1.4', cursor: 'pointer' }} onClick={() => setIsDifferential(!isDifferential)}>
                        Is the supply eligible to be taxed at a differential percentage (%) of the existing rate of tax,<br/>as notified by the Government?
                    </label>
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

export default GSTR1AdvTaxAmendmentSummary;
