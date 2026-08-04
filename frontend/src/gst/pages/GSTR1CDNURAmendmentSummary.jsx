import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import './Dashboard.css';
import './GSTR1Dashboard.css';
import './GSTR1B2BDashboard.css';

const GSTR1CDNURAmendmentSummary = () => {
    const navigate = useNavigate();
    const [financialYear, setFinancialYear] = useState('2026-27');
    const [noteNo, setNoteNo] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showInfo, setShowInfo] = useState(true);

    const handleAmend = async () => {
        if (!noteNo.trim()) {
            setError('Please enter Credit/Debit Note No.');
            return;
        }
        setError('');
        
        // Search the database for the entered note number in saved CDNUR records
        setLoading(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const res = await api.get(`/forms/tab/${trn}/GSTR1_CDNUR_Invoices`);
            
            let foundNote = null;
            if (res.data.success && res.data.data) {
                const notes = Array.isArray(res.data.data.invoices) ? res.data.data.invoices : (Array.isArray(res.data.data) ? res.data.data : []);
                foundNote = notes.find(n => (n.noteNo || n.cdnurNo || n.invoiceNo || n.documentNo || '') === noteNo.trim());
            }

            if (foundNote) {
                // Navigate to the CDNUR Amendment Details page and load the existing data for editing
                toast.success('Credit/Debit Note found! Navigating to amend details...');
                navigate('/returns/auth/gstr1/cdn/unregistered/amendment/details', { state: { invoice: foundNote } });
            } else {
                toast.error('No matching Credit/Debit Note found.');
            }
        } catch (error) {
            console.error("Failed to search note", error);
            toast.error('Error searching for Credit/Debit Note.');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        // Simulate data reload
        await new Promise(resolve => setTimeout(resolve, 500));
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
                    <span style={{ color: '#4b5563' }}>CDNURA</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="gstr1-main-content" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: '1' }}>
                
                {/* Cyan Header Banner */}
                <div className="b2b-header-banner" style={{ backgroundColor: '#14b8a6', padding: '10px 15px', color: '#fff', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '500' }}>9C - Amended Credit/Debit Notes (Unregistered)</h2>
                    <div className="gstr1-header-actions" style={{ display: 'flex', gap: '10px' }}>
                        <button className="gstr1-btn-secondary" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            HELP <span style={{ fontSize: '11px', border: '1px solid #fff', borderRadius: '50%', padding: '0 4px' }}>?</span>
                        </button>
                        <button className="gstr1-btn-icon" style={{ backgroundColor: '#2b4b7c', border: '1px solid #1b2e4b', color: 'white', padding: '4px 8px', cursor: 'pointer', borderRadius: '3px' }} onClick={handleRefresh}>↻</button>
                    </div>
                </div>

                {/* Light Blue Alert Box */}
                {showInfo && (
                    <div style={{ backgroundColor: '#e0f2fe', padding: '15px', marginTop: '20px', color: '#0369a1', fontSize: '14px', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '18px', 
                                height: '18px', 
                                borderRadius: '50%', 
                                backgroundColor: '#0284c7', 
                                color: 'white', 
                                fontSize: '12px', 
                                fontWeight: 'bold' 
                            }}>i</span>
                            There are no records to be displayed.
                        </div>
                        <button 
                            onClick={() => setShowInfo(false)} 
                            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Mandatory Fields Indicator */}
                <div style={{ textAlign: 'right', marginTop: '15px', fontSize: '12px', color: '#4b5563' }}>
                    <span style={{ color: 'red', marginRight: '4px' }}>●</span>
                    Indicates Mandatory Fields
                </div>

                {/* Form Area */}
                <div style={{ marginTop: '20px', display: 'flex', gap: '40px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                            Financial Year <span style={{ color: 'red' }}>*</span>
                        </label>
                        <select 
                            value={financialYear}
                            onChange={(e) => setFinancialYear(e.target.value)}
                            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px', width: '250px', fontSize: '14px' }}
                        >
                            <option value="2026-27">2026-27</option>
                            <option value="2025-26">2025-26</option>
                            <option value="2024-25">2024-25</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                            Credit/Debit Note No. <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="Enter Credit/Debit Note No."
                            value={noteNo}
                            onChange={(e) => {
                                setNoteNo(e.target.value);
                                if (error) setError('');
                            }}
                            style={{ padding: '8px', border: error ? '1px solid red' : '1px solid #d1d5db', borderRadius: '4px', width: '250px', fontSize: '14px' }}
                        />
                        {error && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{error}</span>}
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

export default GSTR1CDNURAmendmentSummary;
