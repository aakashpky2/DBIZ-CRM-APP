import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1Dashboard.css';
import './GSTR2BDashboard.css';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';

const GSTR2BDashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [profile, setProfile] = useState({
        gstin: '32AAICD8127A1Z4',
        legalName: 'D MIX MEDIA PRIVATE LIMITED',
        tradeName: '',
        arn: 'AA3203261234567',
        arnDate: '15/03/2026',
        stateName: 'Kerala'
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                
                // Fetch profile
                try {
                    const profRes = await api.get(`/forms/gstr1-profile/${trn}`);
                    if (profRes.data.success) {
                        setProfile(profRes.data.data);
                    }
                } catch (e) {
                    console.warn("Profile fetch failed, using default mockup values.");
                }

                // Fetch GSTR-2B Summary details
                const sumRes = await api.get(`/forms/gstr2b-summary/${trn}`);
                if (sumRes.data.success) {
                    setSummary(sumRes.data.data);
                }
            } catch (err) {
                console.error("Dashboard failed to load:", err);
                toast.error("Failed to load GSTR-2B dashboard data");
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const formatCurr = (val) => {
        if (val === undefined || val === null) return "₹0.00";
        return "₹" + parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    const handleRefresh = () => {
        setLoading(true);
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    const s = summary || {};
    const itcAvail = s.itcAvailable || { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 };
    const itcNotAvail = s.itcNotAvailable || { records: 0, value: 0, taxAmount: 0 };
    const debNotes = s.debitNotes || { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 };
    const credNotes = s.creditNotes || { records: 0, value: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 };
    const impGoods = s.importGoods || { records: 0, value: 0, igst: 0 };
    const impServ = s.importServices || { records: 0, value: 0, igst: 0 };

    // Derived Cards
    const totalSuppliersCount = new Set([
        ...(itcAvail.recordsList || []).map(r => r.supplierGSTIN || r.supplierGstin),
        ...(itcNotAvail.recordsList || []).map(r => r.supplierGSTIN || r.supplierGstin),
        ...(debNotes.recordsList || []).map(r => r.supplierGSTIN || r.supplierGstin),
        ...(credNotes.recordsList || []).map(r => r.supplierGSTIN || r.supplierGstin)
    ].filter(Boolean)).size;

    const totalInvoicesCount = (itcAvail.records || 0) + (itcNotAvail.records || 0) + (impServ.records || 0);

    const eligibleITCVal = (itcAvail.igst || 0) + (itcAvail.cgst || 0) + (itcAvail.sgst || 0) + (itcAvail.cess || 0) + 
                          (debNotes.igst || 0) + (debNotes.cgst || 0) + (debNotes.sgst || 0) + (debNotes.cess || 0) +
                          (impGoods.igst || 0) + (impServ.igst || 0) -
                          ((credNotes.igst || 0) + (credNotes.cgst || 0) + (credNotes.sgst || 0) + (credNotes.cess || 0));

    const ineligibleITCVal = itcNotAvail.taxAmount || 0;

    const sections = [
        { id: 'itc-available', title: '1. ITC Available', count: itcAvail.records, value: itcAvail.value },
        { id: 'itc-not-available', title: '2. ITC Not Available', count: itcNotAvail.records, value: itcNotAvail.value },
        { id: 'debit-notes', title: '3. Debit Notes (ITC Additions)', count: debNotes.records, value: debNotes.value },
        { id: 'credit-notes', title: '4. Credit Notes (ITC Reductions)', count: credNotes.records, value: credNotes.value },
        { id: 'import-goods', title: '5. Import of Goods (BOEs)', count: impGoods.records, value: impGoods.value },
        { id: 'import-services', title: '6. Import of Services', count: impServ.records, value: impServ.value }
    ];

    return (
        <>
        <PageLoader loading={loading} />
        <div className="dashboard-container" onClick={handleBackdropClick} style={{ backgroundColor: '#f1f3f6' }}>
            <Toaster position="top-right" />
            
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>GSTR-2B</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="gstr1-main-content" style={{ marginTop: '10px' }}>
                
                {/* Header Banner - Portal Teal */}
                <div className="gstr1-header-banner" style={{ backgroundColor: '#1eb3a6' }}>
                    <h2 className="gstr1-title">GSTR-2B - Auto-Drafted Input Tax Credit (ITC) Statement</h2>
                    <div className="gstr1-header-actions">
                        <button className="gstr1-btn-secondary" style={{ backgroundColor: '#3b5f8f' }}>ITC ADVISORY</button>
                        <button className="gstr1-btn-secondary" style={{ backgroundColor: '#3b5f8f' }}>HELP ?</button>
                        <button className="gstr1-btn-icon" style={{ backgroundColor: '#3b5f8f' }} onClick={handleRefresh}>↻</button>
                    </div>
                </div>

                {/* Taxpayer Information Block */}
                <div className="gstr1-info-block" style={{ marginBottom: '10px' }}>
                    <div className="info-column">
                        <p><span>GSTIN</span> - {profile.gstin}</p>
                        <p><span>Financial Year</span> - 2025-26</p>
                    </div>
                    <div className="info-column">
                        <p><span>Legal Name</span> - {profile.legalName}</p>
                        <p><span>Tax Period</span> - March</p>
                    </div>
                    <div className="info-column">
                        <p><span>Trade Name</span> - {profile.tradeName || 'N/A'}</p>
                        <p><span>Status</span> - Auto-Drafted</p>
                    </div>
                    <div className="info-column text-right">
                        <p className="mandatory-note"><span className="red-dot">•</span> Read-Only Auto-Statement</p>
                        <p><span>Generation Date</span> - 12/04/2026</p>
                    </div>
                </div>

                {/* Summary Portal Cards Row */}
                <div className="gstr2b-summary-cards-container">
                    {/* Card 1: Total Suppliers */}
                    <div className="gstr2b-summary-card total">
                        <div className="gstr2b-card-label">Total Suppliers</div>
                        <div className="gstr2b-card-value">{totalSuppliersCount} Active</div>
                        <div className="gstr2b-card-subvalues">
                            <span>Reporting Period:</span>
                            <span>M3 (March)</span>
                        </div>
                    </div>

                    {/* Card 2: Total Invoices */}
                    <div className="gstr2b-summary-card total">
                        <div className="gstr2b-card-label">Total Invoices/BOEs</div>
                        <div className="gstr2b-card-value">{totalInvoicesCount} Records</div>
                        <div className="gstr2b-card-subvalues">
                            <span>Imported Goods:</span>
                            <span>{impGoods.records}</span>
                        </div>
                    </div>

                    {/* Card 3: Eligible ITC */}
                    <div className="gstr2b-summary-card eligible">
                        <div className="gstr2b-card-label">Eligible ITC Available</div>
                        <div className="gstr2b-card-value">{formatCurr(eligibleITCVal)}</div>
                        <div className="gstr2b-card-subvalues">
                            <span>Net IGST:</span>
                            <span>{formatCurr((itcAvail.igst || 0) + (debNotes.igst || 0) + (impGoods.igst || 0) + (impServ.igst || 0) - (credNotes.igst || 0))}</span>
                        </div>
                    </div>

                    {/* Card 4: Ineligible ITC */}
                    <div className="gstr2b-summary-card ineligible">
                        <div className="gstr2b-card-label">Ineligible / Blocked ITC</div>
                        <div className="gstr2b-card-value">{formatCurr(ineligibleITCVal)}</div>
                        <div className="gstr2b-card-subvalues">
                            <span>Part B Not Avail:</span>
                            <span>{formatCurr(itcNotAvail.taxAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Grid Header */}
                <div className="accordion-header" style={{ backgroundColor: '#1b2e4b', cursor: 'default' }}>
                    <h3>GSTR-2B Table Sections Workspace</h3>
                    <span className="accordion-icon">📊</span>
                </div>

                {/* Category Cards Grid */}
                <div className="accordion-body" style={{ backgroundColor: '#e0e6ed', padding: '20px' }}>
                    <div className="record-cards-grid">
                        {sections.map((sec, index) => (
                            <div
                                className="record-card"
                                key={index}
                                onClick={() => navigate(`/returns/gstr2b/section/${sec.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="record-card-top" style={{ backgroundColor: '#2b4b7c' }}>
                                    <h4>{sec.title}</h4>
                                </div>
                                <div className="record-card-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div className="record-status-badge">
                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4caf50', marginRight: '6px' }}>
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '15px' }}>
                                            {sec.count} Records
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
                                        Taxable: {formatCurr(sec.value)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Alert Banner */}
                <div className="gstr1-bottom-alert" style={{ backgroundColor: '#eef2ff', borderColor: '#c7d2fe', marginTop: '20px' }}>
                    <p className="alert-text" style={{ color: '#4f46e5' }}>
                        <strong>Auto-Drafted Input Tax Credit Statement Notice:</strong> Form GSTR-2B is generated on the 12th day of the succeeding month based on outward details filed by your respective suppliers in their GSTR-1, GSTR-5, or GSTR-6 returns. Verify eligible tax credit amounts before utilizing them to offset liabilities in your monthly GSTR-3B return.
                    </p>
                </div>

                {/* Core Action Buttons */}
                <div className="gstr1-bottom-actions" style={{ marginBottom: '40px' }}>
                    <button className="gstr1-btn-outline" onClick={() => navigate('/returns-dashboard')}>BACK</button>
                    <button className="gstr1-btn-primary" style={{ backgroundColor: '#4f46e5' }} onClick={() => navigate('/returns/gstr2b/summary')}>GENERATE SUMMARY</button>
                    <button className="gstr1-btn-primary" style={{ backgroundColor: '#1eb3a6' }} onClick={() => navigate('/returns/gstr2b/pdf-preview')}>DOWNLOAD GSTR-2B PDF</button>
                </div>
            </div>

            {/* Footer Bar */}
            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 24-02-2026</div>
                <div className="footer-right">Designed & Developed by GSTN</div>
            </footer>
        </div>
        </>
    );
};

export default GSTR2BDashboard;
