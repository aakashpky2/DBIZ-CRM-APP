import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1Dashboard.css';
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import toast from 'react-hot-toast';
import PageLoader from '../components/PageLoader';

const subMenus = {
    services: [
        { label: 'Registration', to: '/registration' },
        { label: 'Ledgers', to: '#' },
        { label: 'Returns', to: '#' },
        { label: 'Payments', to: '#' },
        { label: 'User Services', to: '#' },
        { label: 'Refunds', to: '#' },
        { label: 'e-Way Bill System', to: '#' },
        { label: 'Track Application Status', to: '#' },
    ],
    downloads: [
        { label: 'Offline Tools', to: '#' },
        { label: 'Accounting and Billing Software', to: '#' },
    ],
    search: [
        { label: 'Search by GSTIN/UIN', to: '#' },
        { label: 'Search by PAN', to: '#' },
        { label: 'Search Temporary ID', to: '#' },
        { label: 'Search Composition Taxpayer', to: '#' },
    ],
};

const amendCards = [
    "9A - Amended B2B Invoices",
    "9A - Amended B2C (Large) Invoices",
    "9A - Amended Exports Invoices",
    "9C - Amended Credit/Debit Notes (Registered)",
    "9C - Amended Credit/Debit Notes (Unregistered)",
    "10 - Amended B2C(Others)",
    "11A - Amended Tax Liability (Advances Received)",
    "11B - Amendment of Adjustment of Advances",
    "14A - Amended Supplies made through ECO",
    "15A - Amended Supplies U/s 9(5)"
].map(title => ({ title, count: 0 }));

const GSTR1Dashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [b2bCount, setB2bCount] = useState(0);
    const [b2clCount, setB2clCount] = useState(0);
    const [exportsCount, setExportsCount] = useState(0);
    const [b2csCount, setB2csCount] = useState(0);
    const [nilRatedCount, setNilRatedCount] = useState(0);
    const [cdnrCount, setCdnrCount] = useState(0);
    const [cdnurCount, setCdnurCount] = useState(0);
    const [advTaxCount, setAdvTaxCount] = useState(0);
    const [adjAdvancesCount, setAdjAdvancesCount] = useState(0);
    const [hsnCount, setHsnCount] = useState(0);
    const [docsCount, setDocsCount] = useState(0);
    const [ecoCount, setEcoCount] = useState(0);
    const [sup95Count, setSup95Count] = useState(0);
    const [isNilFile, setIsNilFile] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showAmendDetails, setShowAmendDetails] = useState(false);
    const [isAddRecordOpen, setIsAddRecordOpen] = useState(true);
    const [isEInvoiceOpen, setIsEInvoiceOpen] = useState(true);

    const fetchGstr1Data = async () => {
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            
            const countRes = await gstr1Service.getGstr1Counts(trn);
            const c = countRes.data || {};

            setB2bCount(c.b2b || 0);
            setB2clCount(c.b2cl || 0);
            setExportsCount(c.exports || 0);
            setB2csCount(c.b2cs || 0);
            setNilRatedCount(c.nilRated || 0);
            setCdnrCount(c.cdnr || 0);
            setCdnurCount(c.cdnur || 0);
            setAdvTaxCount(c.advTax || 0);
            setAdjAdvancesCount(c.adjAdvances || 0);
            setHsnCount(c.hsn || 0);
            setDocsCount(c.documents || 0);
            setEcoCount(c.eco || 0);
            setSup95Count(c.sup95 || 0);

        } catch (error) {
            console.error("Failed to fetch invoice counts:", error);
        }
    };

    useEffect(() => {
        fetchGstr1Data();
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        document.body.style.overflow = "hidden";
        await fetchGstr1Data();
        setLoading(false);
        document.body.style.overflow = "auto";
    };

    const handleReset = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to reset GSTR-1?\nAll saved GSTR-1 data will be permanently deleted.\nThis action cannot be undone.'
        );

        if (!confirmed) return;

        try {
            setLoading(true);
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            
            // Call the new gstr1 reset API to clear the 13 postgres tables
            await gstr1Service.resetGstr1Data(trn);
            
            // Also call the old API to clear any legacy blob data just in case
            await api.delete(`/forms/reset/${trn}`);

            toast.success('GSTR-1 data reset successfully.');

            // Immediately reset frontend counts
            setB2bCount(0);
            setB2clCount(0);
            setExportsCount(0);
            setB2csCount(0);
            setNilRatedCount(0);
            setCdnrCount(0);
            setCdnurCount(0);
            setAdvTaxCount(0);
            setAdjAdvancesCount(0);
            setHsnCount(0);
            setDocsCount(0);
            setEcoCount(0);
            setSup95Count(0);
        } catch (error) {
            console.error("Reset failed", error);
            toast.error('Failed to reset GSTR-1 data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMenu = (menu) => {
        setActiveMenu(prev => (prev === menu ? null : menu));
    };

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    const recordCards = [
        "4A, 4B, 6B, 6C - B2B, SEZ, DE Invoices",
        "5A, 5B - B2C (Large) Invoices",
        "6A - Exports Invoices",
        "7 - B2C (Others)",
        "8A, 8B, 8C, 8D - Nil Rated Supplies",
        "9B - Credit / Debit Notes (Registered)",
        "9B - Credit / Debit Notes (Unregistered)",
        "11A(1), 11A(2) - Tax Liability (Advances Received)",
        "11B(1), 11B(2) - Adjustment of Advances",
        "12 - HSN-wise summary of outward supplies",
        "13 - Documents Issued",
        "14 - Supplies made through ECO",
        "15 - Supplies U/s 9(5)"
    ];

    return (
        <>
            <PageLoader loading={loading} />
            <div className="dashboard-container" onClick={handleBackdropClick} style={{ backgroundColor: '#f1f3f6' }}>
                {/* Breadcrumb Bar */}
                <div className="dashboard-breadcrumb-bar">
                    <div className="breadcrumb-left">
                        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link>
                        <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                        <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Returns</Link>
                        <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                        <span style={{ color: '#4b5563' }}>GSTR-1/IFF</span>
                    </div>
                    <div className="breadcrumb-right">
                        <span>🌐 English</span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="gstr1-main-content">
                    {/* Header Banner - Cyan */}
                    <div className="gstr1-header-banner">
                        <h2 className="gstr1-title">GSTR-1 - Details of outward supplies of goods or services</h2>
                        <div className="gstr1-header-actions">
                            <button className="gstr1-btn-secondary">E-INVOICE ADVISORY</button>
                            <button className="gstr1-btn-secondary">HELP <span style={{ fontSize: '12px', border: '1px solid #fff', borderRadius: '50%', padding: '0 4px', marginLeft: '4px' }}>?</span></button>
                            <button className="gstr1-btn-icon" onClick={handleRefresh}>↻</button>
                        </div>
                    </div>

                    {/* Info Block */}
                    <div className="gstr1-info-block">
                        <div className="info-column">
                            <p><span>GSTIN</span> - 32AAICD8127A1Z4</p>
                            <p><span>FY</span> - 2025-26</p>
                        </div>
                        <div className="info-column">
                            <p><span>Legal Name</span> - D MIX MEDIA PRIVATE LIMITED</p>
                            <p><span>Tax Period</span> - March</p>
                        </div>
                        <div className="info-column">
                            <p><span>Trade Name</span> -</p>
                            <p><span>Status</span> - Not Filed</p>
                        </div>
                        <div className="info-column text-right">
                            <p className="mandatory-note"><span className="red-dot">•</span> Indicates Mandatory Fields</p>
                            <p><span>Due Date</span> - 11/04/2026</p>
                        </div>
                    </div>

                    {/* Nil Checkbox */}
                    <div className="gstr1-checkbox-strip">
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 500, color: '#333' }}>
                            <input 
                                type="checkbox" 
                                style={{ marginRight: '10px', width: '16px', height: '16px' }} 
                                checked={isNilFile}
                                onChange={(e) => setIsNilFile(e.target.checked)}
                            />
                            File Nil GSTR-1
                        </label>
                    </div>

                    {isNilFile && (
                        <div className="nil-note-box" style={{ backgroundColor: '#eef2ff', border: '1px solid #3b82f6', padding: '15px 20px', borderRadius: '4px', margin: '15px 0' }}>
                            <h4 style={{ color: '#1e40af', margin: '0 0 10px 0', fontSize: '15px' }}>Note: NIL Form GSTR-1 can be filed by you if you have:</h4>
                            <ol type="a" style={{ color: '#1e40af', fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
                                <li>No Outward Supplies (including supplies on which tax is to be charged on reverse charge basis, zero rated supplies and deemed exports) during the month or quarter for which the form is being filed for</li>
                                <li>No Amendments to be made to any of the supplies declared in an earlier form</li>
                                <li>No Credit or Debit Notes to be declared / amended</li>
                                <li>No details of advances received for services is to be declared or adjusted</li>
                            </ol>
                        </div>
                    )}

                    {!isNilFile && (
                        <>
                            {/* Add Record Details Accordion */}
                            <div className={`gstr1-accordion ${isAddRecordOpen ? 'open' : ''}`}>
                                <div className="accordion-header" onClick={() => setIsAddRecordOpen(!isAddRecordOpen)} style={{ cursor: 'pointer' }}>
                                    <h3>ADD RECORD DETAILS</h3>
                                    <span className="accordion-icon">{isAddRecordOpen ? "▲" : "▼"}</span>
                                </div>
                                <div className={`accordion-body-wrapper ${isAddRecordOpen ? 'open' : ''}`}>
                                    <div className="accordion-body-inner">
                                        <div className="accordion-body">
                                            <div className="record-cards-grid">
                                        {recordCards.map((title, index) => (
                                            <div
                                                className="record-card"
                                                key={index}
                                                onClick={() => {
                                                    if (index === 0) navigate('/returns/gstr1/b2b');
                                                    else if (index === 1) navigate('/returns/auth/gstr1/b2cl/summary');
                                                    else if (index === 2) navigate('/returns/gstr1/exports');
                                                    else if (index === 3) navigate('/returns/gstr1/b2cs');
                                                    else if (index === 4) navigate('/returns/gstr1/nilrated/add');
                                                    else if (index === 5) navigate('/returns/gstr1/cdnr');
                                                    else if (index === 6) navigate('/returns/gstr1/cdnur');
                                                    else if (index === 7) navigate('/returns/gstr1/advtax');
                                                    else if (index === 8) navigate('/returns/gstr1/adjadvances');
                                                    else if (index === 9) navigate('/returns/gstr1/hsn');
                                                    else if (index === 10) navigate('/returns/gstr1/documents');
                                                    else if (index === 11) navigate('/returns/gstr1/eco');
                                                    else if (index === 12) navigate('/returns/gstr1/sup95');
                                                }}
                                                style={{ cursor: (index === 0 || index === 1 || index === 2 || index === 3 || index === 4 || index === 5 || index === 6 || index === 7 || index === 8 || index === 9 || index === 10 || index === 11 || index === 12) ? 'pointer' : 'default' }}
                                            >
                                                <div className="record-card-top">
                                                    <h4>{title}</h4>
                                                </div>
                                                <div className="record-card-bottom">
                                                    <div className="record-status-badge">
                                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4caf50', marginRight: '6px' }}>
                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                        </svg>
                                                        <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '15px' }}>
                                                            {index === 0 ? b2bCount : (index === 1 ? b2clCount : (index === 2 ? exportsCount : (index === 3 ? b2csCount : (index === 4 ? nilRatedCount : (index === 5 ? cdnrCount : (index === 6 ? cdnurCount : (index === 7 ? advTaxCount : (index === 8 ? adjAdvancesCount : (index === 9 ? hsnCount : (index === 10 ? docsCount : (index === 11 ? ecoCount : (index === 12 ? sup95Count : 0))))))))))))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Amend Record Details Accordion */}
                            <div className={`gstr1-accordion ${showAmendDetails ? 'open' : ''}`}>
                                <div className="accordion-header" onClick={() => setShowAmendDetails(!showAmendDetails)} style={{ cursor: 'pointer' }}>
                                    <h3>AMEND RECORD DETAILS</h3>
                                    <span className="accordion-icon">{showAmendDetails ? "▲" : "▼"}</span>
                                </div>
                                <div className={`accordion-body-wrapper ${showAmendDetails ? 'open' : ''}`}>
                                    <div className="accordion-body-inner">
                                        <div className="accordion-body">
                                            <div className="record-cards-grid">
                                            {amendCards.map((card, index) => (
                                                <div 
                                                    className="record-card" 
                                                    key={index}
                                                    onClick={() => {
                                                        if (index === 0) navigate('/returns/auth/gstr1/b2b/amendment/summary');
                                                        else if (index === 1) navigate('/returns/auth/gstr1/b2cl/amendment/summary');
                                                        else if (index === 2) navigate('/returns/auth/gstr1/export/amendment/summary');
                                                        else if (index === 3) navigate('/returns/auth/gstr1/cdn/registered/amendment/summary');
                                                        else if (index === 4) navigate('/returns/auth/gstr1/cdn/unregistered/amendment/summary');
                                                        else if (index === 5) navigate('/returns/auth/gstr1/b2cs/amendment/summary');
                                                        else if (index === 6) navigate('/returns/auth/gstr1/advtax/amendment/summary');
                                                        else if (index === 7) navigate('/returns/auth/gstr1/txpd/amendment/summary');
                                                        else if (index === 8) navigate('/returns/auth/gstr1/ecomaopt/amendment/summary');
                                                        else if (index === 9) navigate('/returns/auth/gstr1/sup15a/summary');
                                                    }}
                                                    style={{ cursor: (index >= 0 && index <= 9) ? 'pointer' : 'default' }}
                                                >
                                                    <div className="record-card-top">
                                                        <h4>{card.title}</h4>
                                                    </div>
                                                    <div className="record-card-bottom">
                                                        <div className="record-status-badge">
                                                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4caf50', marginRight: '6px' }}>
                                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                            </svg>
                                                            <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '15px' }}>
                                                                {card.count}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Info Alert */}
                    <div className="gstr1-bottom-alert">
                        <span className="info-icon" style={{ marginRight: '10px' }}>i</span>
                        <p className="alert-text">
                            The taxpayers for whom e-invoicing is not applicable may ignore the sections/options related to e-invoice download. The downloaded file would be blank in case taxpayer is not e-invoicing or when e-invoices reported to IRP are yet to be processed by GST system
                        </p>
                    </div>

                    {!isNilFile && (
                        <div className={`gstr1-accordion ${isEInvoiceOpen ? 'open' : ''}`}>
                            <div className="accordion-header" onClick={() => setIsEInvoiceOpen(!isEInvoiceOpen)} style={{ cursor: 'pointer' }}>
                                <h3>E-INVOICE DOWNLOAD HISTORY</h3>
                                <span className="accordion-icon">{isEInvoiceOpen ? "▲" : "▼"}</span>
                            </div>
                            <div className={`accordion-body-wrapper ${isEInvoiceOpen ? 'open' : ''}`}>
                                <div className="accordion-body-inner">
                                    <div className="accordion-body">
                                        <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '15px 20px', border: '1px solid #bae6fd', marginBottom: '15px', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                                            <span className="info-icon" style={{ marginRight: '10px', backgroundColor: '#0369a1', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>i</span>
                                            No files available for download
                                        </div>
                                        <div style={{ backgroundColor: '#fff', minHeight: '120px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="gstr1-bottom-actions">
                        <button className="gstr1-btn-outline" onClick={() => navigate('/returns-dashboard')}>BACK</button>
                        <button className="gstr1-btn-primary">DOWNLOAD DETAILS FROM E-INVOICES (EXCEL)</button>
                        <button className="gstr1-btn-primary" onClick={handleReset}>RESET</button>
                        <button className="gstr1-btn-primary" onClick={() => navigate('/returns/gstr1/summary')}>GENERATE SUMMARY</button>
                        <button className="gstr1-btn-primary" style={{ background: '#e65100' }} onClick={() => navigate('/returns/gstr1/pdf-preview?fy=2025-26&month=March')}>GENERATE PDF</button>
                    </div>

                </div>

                <div style={{ flexGrow: 1 }}></div>

                {/* Footer Bar */}
                <footer className="dashboard-footer-bar">
                    <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                    <div className="footer-center">Site Last Updated on 24-01-2026</div>
                    <div className="footer-right">Designed &amp; Developed by GSTN</div>
                </footer>

                <div className="bottom-info-blue-bar">
                    Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
                </div>
            </div>
        </>
    );
};

export default GSTR1Dashboard;
