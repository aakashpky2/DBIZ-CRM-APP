import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import './Dashboard.css';

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

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleCreateChallanNav = () => {
        navigate('/payment/create-challan');
        setTimeout(() => {
            navigate('/payment/reason-for-challan');
        }, 0);
    };

    const [activeMenu, setActiveMenu] = useState(null);
    const [showAadhaarModal, setShowAadhaarModal] = useState(true);
    const [displayName, setDisplayName] = useState(localStorage.getItem('gst_legal_name') || 'GST User');

    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                // We use our axios instance which automatically passes the auth token
                const { data } = await api.get('/auth/me');
                if (data?.success && data?.data) {
                    const user = data.data;
                    const finalName = user.company_name || user.legal_name || 'GST User';
                    setDisplayName(finalName);
                    // Update localStorage so other places can use it immediately if needed
                    localStorage.setItem('gst_legal_name', finalName);
                }
            } catch (err) {
                console.warn('Failed to fetch user data for dashboard', err);
            }
        };
        fetchUserData();
    }, []);

    const toggleMenu = (menu) => {
        setActiveMenu(prev => (prev === menu ? null : menu));
    };

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    return (
        <div className="dashboard-container" onClick={handleBackdropClick}>
            {/* Aadhaar Modal */}
            {showAadhaarModal && (
                <div className="aadhaar-modal-overlay">
                    <div className="aadhaar-modal-content">
                        <h3 className="aadhaar-modal-text">
                            Would you like to Authenticate Aadhaar or Upload E-KYC Documents of Partner/Promoter and Primary Authorized Signatory?
                        </h3>
                        <div className="aadhaar-modal-buttons">
                            <button className="aadhaar-btn-yes" onClick={() => navigate('/aadhaar-authentication')}>
                                YES, NAVIGATE TO MY PROFILE
                            </button>
                            <button className="aadhaar-btn-later" onClick={() => setShowAadhaarModal(false)}>
                                REMIND ME LATER
                            </button>
                        </div>
                        <div className="aadhaar-modal-footer">
                            NOTE : For future reference you can access this link again through <strong>Dashboard &gt; My Profile &gt; Aadhaar Authentication Status</strong>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">Dashboard</div>
                <div className="breadcrumb-right">
                    <span className="skip-to-content">Skip to Main Content</span>
                    <span>🌐 English</span>
                    <span>A-</span>
                    <span>A</span>
                    <span>A+</span>
                </div>
            </div>

            {/* Login Info Bar */}
            <div className="login-info-bar">
                <div>Last logged in on <strong>{new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></div>
                <div>Currently logged in from IP: <strong>27.63.236.205</strong></div>
            </div>


            {/* Main Content Area */}
            <div className="dashboard-main-content">
                {/* Welcome Header */}
                <div className="welcome-section" style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 className="welcome-title" style={{ fontSize: '18px', fontWeight: 'bold' }}>Welcome {displayName} to GST Common Portal</h2>

                    <div className="filing-preference" style={{ fontSize: '14px', marginTop: '8px' }}>
                        Return filing preference (Jan-Mar 2026) : Monthly (<Link to="#" style={{ textDecoration: 'none', color: '#0056b3' }}>Change</Link>)
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
                    <div className="content-left" style={{ flex: 1 }}>
                        {/* Returns Calendar */}
                        <div className="returns-calendar-container">
                            <h3 className="calendar-title">Returns Calendar (Last 5 return periods)</h3>
                            <table className="calendar-table">
                                <thead>
                                    <tr>
                                        <th className="calendar-header-label">GSTR-1 / IFF</th>
                                        <th className="month-header filed-cell"><div className="cell-main">Oct - 2025<br /><span className="status-text">Filed</span></div><div className="hover-anim-panel">Filed on :<br />10/10/2025</div></th>
                                        <th className="month-header filed-cell"><div className="cell-main">Nov - 2025<br /><span className="status-text">Filed</span></div><div className="hover-anim-panel">Filed on :<br />10/11/2025</div></th>
                                        <th className="month-header filed-cell"><div className="cell-main">Dec - 2025<br /><span className="status-text">Filed</span></div><div className="hover-anim-panel">Filed on :<br />10/12/2025</div></th>
                                        <th className="month-header filed-cell"><div className="cell-main">Jan - 2026<br /><span className="status-text">Filed</span></div><div className="hover-anim-panel">Filed on :<br />10/01/2026</div></th>
                                        <th className="month-header filed-cell"><div className="cell-main">Feb - 2026<br /><span className="status-text">Filed</span></div><div className="hover-anim-panel">Filed on :<br />10/02/2026</div></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th className="calendar-header-label">GSTR-3B</th>
                                        <td className="cell-filed filed-cell"><div className="cell-main">Oct - 2025<br /><span className="status-text">Filed</span></div><div className="hover-anim-panel">Filed on :<br />20/10/2025</div></td>
                                        <td className="cell-filed filed-cell"><div className="cell-main">Nov - 2025<br /><span className="status-text">Filed</span></div><div className="hover-anim-panel">Filed on :<br />20/11/2025</div></td>
                                        <td className="cell-filed filed-cell"><div className="cell-main">Dec - 2025<br /><span className="status-text">Filed</span></div><div className="hover-anim-panel">Filed on :<br />20/12/2025</div></td>
                                        <td className="cell-filed filed-cell"><div className="cell-main">Jan - 2026<br /><span className="status-text">Filed</span></div><div className="hover-anim-panel">Filed on :<br />20/01/2026</div></td>
                                        <td className="cell-to-be-filed" style={{ backgroundColor: '#e67e22' }}><div className="cell-main">Feb - 2026<br /><span className="status-text">To be Filed</span></div></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="info-box-container">
                            <div className="info-box">
                                You can navigate to your chosen page through navigation panel given below
                            </div>
                            <div className="geocode-box">
                                A facility is provided to you to Geocode the existing business addresses saved in GST system. Kindly click on Continue to update the Geocoded Addresses. Please note that the existing addresses appearing in the GST system/Registration Certificate will not be impacted. <span className="continue-link">Continue ⓘ</span>
                            </div>
                        </div>

                        {/* Action Buttons Grid */}
                        <div className="action-buttons-container" style={{ marginTop: '30px', flexDirection: 'column', gap: '20px' }}>
                            <div className="top-buttons-row" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                <button className="action-btn" onClick={() => navigate('/returns-dashboard')}>RETURN DASHBOARD <span>&gt;</span></button>
                                <button className="action-btn" onClick={handleCreateChallanNav}>CREATE CHALLAN <span>&gt;</span></button>
                                <button className="action-btn" onClick={() => navigate('/services/user-services/notices-orders')}>VIEW NOTICE(S) AND ORDER(S) <span>&gt;</span></button>
                            </div>
                            <div className="middle-button-row" style={{ display: 'flex', justifyContent: 'center' }}>
                                <button className="action-btn" style={{ maxWidth: '300px' }} onClick={() => navigate('/returns/annual-return')}>ANNUAL RETURN <span>&gt;</span></button>
                            </div>

                            <div className="bottom-continue-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>Else Go to &gt;&gt;</span>
                                <button className="action-btn" style={{ maxWidth: '300px' }}>CONTINUE TO DASHBOARD <span>&gt;</span></button>
                            </div>
                        </div>
                    </div>

                    <div className="content-right" style={{ width: '300px' }}>
                        {/* Profile Summary */}
                        <div className="profile-card">
                            <div className="profile-name">{displayName}</div>
                            <div className="profile-gstin">{localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GSTIN/TRN'}</div>

                            <Link to="/my-profile" className="view-profile-link">View Profile <span>▶</span></Link>
                        </div>

                        {/* Quick Links */}
                        <div className="quick-links-container">
                            <h3>Quick Links</h3>
                            <ul className="quick-links-list">
                                <li><Link to="#">Check Cash Balance</Link></li>
                                <li><Link to="#">Liability ledger</Link></li>
                                <li><Link to="#">Credit ledger</Link></li>
                                <li><Link to="#">Electronic Credit Reversal and Re-claimed Statement</Link></li>
                                <li><Link to="#">Negative Liability Statement - Regular Taxpayers</Link></li>
                                <li><Link to="#">RCM Liability/ITC Statement</Link></li>
                                <li><Link to="#">Application for Unbarring Returns</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bar */}
            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 02-02-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>

            <div className="bottom-info-blue-bar">
                Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
            </div>

            <div className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <span>▲</span> Top
            </div>
        </div>
    );
};

export default Dashboard;
