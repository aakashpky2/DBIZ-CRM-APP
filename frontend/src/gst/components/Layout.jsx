import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeMenu, setActiveMenu] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [activeSubMenu, setActiveSubMenu] = useState('registration');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [displayName, setDisplayName] = useState(localStorage.getItem('gst_legal_name') || 'GST USER');

    const handleCreateChallanNav = (e) => {
        e.preventDefault();
        setActiveDropdown(null);
        navigate('/payment/create-challan');
        setTimeout(() => {
            navigate('/payment/reason-for-challan');
        }, 0);
    };

    // All paths that use the GST portal's own nav (bd-navbar) instead of the Layout navbar
    const isRegistrationPath = [
        '/business-details', '/promoter-partners', '/authorized-signatory',
        '/authorized-representative', '/principal-place-of-business',
        '/additional-places-of-business', '/goods-and-services',
        '/state-specific-information', '/aadhaar-authentication', '/verification'
    ].some(path => location.pathname.startsWith(path));

    const isDashboard = location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/returns') ||
        location.pathname.startsWith('/payment') ||
        isRegistrationPath;

    useEffect(() => {
        if (isDashboard) {
            const fetchUserData = async () => {
                try {
                    const { data } = await api.get('/auth/me');
                    if (data?.success && data?.data) {
                        const user = data.data;
                        const finalName = user.company_name || user.legal_name || 'GST USER';
                        setDisplayName(finalName);
                        localStorage.setItem('gst_legal_name', finalName);
                    }
                } catch (err) {
                    console.warn('Failed to fetch user data for layout', err);
                    if (err.response && err.response.status === 401) {
                        if (!isRegistrationPath) {
                            handleLogout();
                        }
                    }
                }
            };
            fetchUserData();
        }
    }, [location.pathname, isDashboard, isRegistrationPath]);

    const toggleMenu = (menu) => {
        if (activeMenu === menu) {
            setActiveMenu(null);
        } else {
            setActiveMenu(menu);
        }
    };

    const handleBackdropClick = () => {
        setActiveMenu(null);
        setShowProfileMenu(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/logout');
    };

    return (
        <div className="app-container" onClick={handleBackdropClick}>
            {/* Top Accessibility Bar — hidden on dashboard/business-details */}
            {!isDashboard && (
                <div className="top-bar">
                    <span className="top-bar-item">Skip to Main Content</span>
                    <span className="top-bar-item">A-</span>
                    <span className="top-bar-item">A</span>
                    <span className="top-bar-item">A+</span>
                    <span className="top-bar-item">English</span>
                </div>
            )}

            {/* Main Header */}
            <header className="main-header">
                <div className="header-left">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <div className="brand-titles" style={{ marginLeft: '15px' }}>
                            <h1 style={{ color: 'white', fontSize: '24px', margin: 0, fontWeight: '500' }}>Goods and Services Tax</h1>
                            <p style={{ color: '#cbd5e0', fontSize: '14px', margin: 0 }}>Government of India, States and Union Territories</p>
                        </div>
                    </Link>
                </div>
                <div className="header-right">
                    {isDashboard ? (
                        <div className="header-dashboard-right" style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'white' }}>
                            {/* User Profile Dropdown */}
                            <div
                                className="user-profile-dropdown"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', position: 'relative' }}
                                onClick={(e) => { e.stopPropagation(); setShowProfileMenu(prev => !prev); }}
                            >
                                <span className="user-name" style={{ fontWeight: '500', fontSize: '14px' }}>{displayName}</span>

                                {showProfileMenu && (
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '8px',
                                            backgroundColor: 'white',
                                            color: '#333',
                                            minWidth: '240px',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                            zIndex: 9999,
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {/* Last Logged In */}
                                        <div style={{ backgroundColor: '#f1f3f6', padding: '10px 15px', borderBottom: '1px solid #ddd', fontSize: '12px', color: '#444' }}>
                                            <p style={{ margin: 0 }}>Last Logged In at</p>
                                            <p style={{ margin: '2px 0 0 0', fontWeight: 'bold' }}>{new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST</p>
                                        </div>
                                        {/* Options */}
                                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                            <li style={{ borderBottom: '1px solid #eee' }}>
                                                <button
                                                    onClick={() => { setShowProfileMenu(false); navigate('/my-profile'); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 15px', cursor: 'pointer', fontSize: '13px', color: '#1a237e', fontWeight: '500' }}
                                                >
                                                    My Profile
                                                </button>
                                            </li>
                                            <li style={{ borderBottom: '1px solid #eee' }}>
                                                <button
                                                    onClick={() => { setShowProfileMenu(false); navigate('/change-password'); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 15px', cursor: 'pointer', fontSize: '13px', color: '#1a237e', fontWeight: '500' }}
                                                >
                                                    Change Password
                                                </button>
                                            </li>
                                            <li style={{ borderBottom: '1px solid #eee' }}>
                                                <button
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 15px', cursor: 'pointer', fontSize: '13px', color: '#1a237e', fontWeight: '500' }}
                                                >
                                                    Register / Update DSC
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'none', border: 'none', padding: '12px 15px', cursor: 'pointer', fontSize: '13px', color: '#1a237e', fontWeight: '500' }}
                                                >
                                                    Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>


                        </div>
                    ) : (
                        <>
                            <button className="btn-register" onClick={() => navigate('/registration')}>Register</button>
                            <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
                        </>
                    )}
                </div>
            </header>

            <style>{`
                .navbar-wrapper {
                    position: relative;
                }
                .nav-item {
                    display: flex;
                }
                .dropdown-panel {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    background: #fff;
                    z-index: 9999;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.25);
                }
                .dropdown-main-row {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    background: #f5f8fa;
                }
                .dropdown-main-item {
                    padding: 14px 22px;
                    color: #001b5c;
                    font-size: 15px;
                    cursor: pointer;
                }
                .dropdown-main-item.active {
                    border-bottom: 2px solid #001b5c;
                    background: #fff;
                }
                .dropdown-sub-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    padding: 12px 22px;
                    gap: 14px 80px;
                }
                .dropdown-sub-row a {
                    color: #001b5c;
                    font-size: 15px;
                    text-decoration: none;
                }
                .dropdown-sub-row a:hover {
                    color: #0070c9;
                }
                .services-active-teal {
                    background-color: #00a2b0 !important;
                }
                .services-active-btn {
                    color: #ffffff !important;
                    background-color: #00a2b0 !important;
                }
            `}</style>
            
            {/* Navigation Bar */}
            <nav className="navbar navbar-wrapper" style={{ overflow: 'visible' }}>
                {!isDashboard ? (
                    <Link to="/" className={`nav-link ${location.pathname === '/' || location.pathname === '/logout' ? 'active' : ''}`} onClick={() => setActiveDropdown(null)}>Home</Link>
                ) : (
                    <Link to="/dashboard" className="nav-link active" onClick={() => setActiveDropdown(null)}>Dashboard</Link>
                )}
                
                <div 
                    className={`nav-item ${location.pathname === '/forgot-password' || location.pathname.startsWith('/services') ? 'services-active-teal' : ''}`}
                    onMouseEnter={() => setActiveDropdown('services')}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button className={`nav-link-btn ${activeDropdown === 'services' ? 'active-link' : ''} ${location.pathname === '/forgot-password' || location.pathname.startsWith('/services') ? 'services-active-btn' : ''}`}>
                        Services ▾
                    </button>
                </div>

                <Link to="/gst-law" className="nav-link" onClick={() => setActiveDropdown(null)}>GST Law</Link>
                
                <div 
                    className={`nav-item ${location.pathname.startsWith('/download') ? 'services-active-teal' : ''}`}
                    onMouseEnter={() => setActiveDropdown('downloads')}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button className={`nav-link-btn ${activeDropdown === 'downloads' ? 'active-link' : ''} ${location.pathname.startsWith('/download') ? 'services-active-btn' : ''}`}>
                        Downloads ▾
                    </button>
                </div>

                <div 
                    className="nav-item"
                    onMouseEnter={() => setActiveDropdown('searchTaxpayer')}
                    onMouseLeave={() => setActiveDropdown(null)}
                >
                    <button className={`nav-link-btn ${activeDropdown === 'searchTaxpayer' ? 'active-link' : ''}`}>
                        Search Taxpayer ▾
                    </button>
                </div>

                <a href="#" className="nav-link" onClick={() => setActiveDropdown(null)}>Help and Taxpayer Facilities</a>
                <a href="#" className="nav-link" onClick={() => setActiveDropdown(null)}>e-Invoice</a>
                <a href="#" className="nav-link" onClick={() => setActiveDropdown(null)}>News and Updates</a>

                {/* Dropdowns */}
                {activeDropdown === 'services' && (
                    <div 
                        className="dropdown-panel" 
                        onMouseEnter={() => setActiveDropdown('services')}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <div className="dropdown-main-row">
                            <div className={`dropdown-main-item ${activeSubMenu === 'registration' ? 'active' : ''}`} onMouseEnter={() => setActiveSubMenu('registration')}>Registration</div>
                            <div className={`dropdown-main-item ${activeSubMenu === 'payments' ? 'active' : ''}`} onMouseEnter={() => setActiveSubMenu('payments')}>Payments</div>
                            <div className={`dropdown-main-item ${activeSubMenu === 'userServices' ? 'active' : ''}`} onMouseEnter={() => setActiveSubMenu('userServices')}>User Services</div>
                            <div className={`dropdown-main-item ${activeSubMenu === 'refunds' ? 'active' : ''}`} onMouseEnter={() => setActiveSubMenu('refunds')}>Refunds</div>
                            <div className="dropdown-main-item" onMouseEnter={() => setActiveSubMenu('eway')}>e-Way Bill System</div>
                            <div className="dropdown-main-item" onMouseEnter={() => setActiveSubMenu('track')}>Track Application Status</div>
                        </div>
                        {activeSubMenu === 'registration' && (
                            <div className="dropdown-sub-row">
                                <Link to="/registration" onClick={() => setActiveDropdown(null)}>New Registration</Link>
                                <Link to="/services/registration/track-application-status" onClick={() => setActiveDropdown(null)}>Track Application Status</Link>
                                <Link to="/registration" onClick={() => setActiveDropdown(null)}>Application for Filing Clarifications</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Home State GSK selection for Promoter/Director of specific COBs</Link>
                            </div>
                        )}
                        {activeSubMenu === 'payments' && (
                            <div className="dropdown-sub-row">
                                <a href="#" onClick={handleCreateChallanNav}>Create Challan</a>
                                <Link to="/services/payments/track-payment-status" onClick={() => setActiveDropdown(null)}>Track Payment Status</Link>
                                <Link to="/services/payments/grievance-against-payment" onClick={() => setActiveDropdown(null)}>Grievance against Payment (GST PMT-07)</Link>
                            </div>
                        )}
                        {activeSubMenu === 'userServices' && (
                            <div className="dropdown-sub-row">
                                <Link to="/services/user-services/search-hsn-code" onClick={() => setActiveDropdown(null)}>Search HSN Code</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Generate User ID for Unregistered Applicant</Link>
                                <Link to="/services/user-services/cause-list" onClick={() => setActiveDropdown(null)}>Cause List</Link>
                                <Link to="/services/user-services/verify-rfn" onClick={() => setActiveDropdown(null)}>Verify RFN</Link>
                                <Link to="/services/user-services/holiday-list" onClick={() => setActiveDropdown(null)}>Holiday List</Link>
                                <Link to="/services/user-services/locate-gstp" onClick={() => setActiveDropdown(null)}>Locate GST Practitioner (GSTP)</Link>
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Search Advance Ruling</Link>
                                <Link to="/services/user-services/notices-orders" onClick={() => setActiveDropdown(null)}>View Notices and Orders</Link>
                            </div>
                        )}
                        {activeSubMenu === 'refunds' && (
                            <div className="dropdown-sub-row">
                                <Link to="#" onClick={() => setActiveDropdown(null)}>Track Application Status</Link>
                            </div>
                        )}
                    </div>
                )}

                {activeDropdown === 'downloads' && (
                    <div 
                        className="dropdown-panel" 
                        onMouseEnter={() => setActiveDropdown('downloads')}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <div className="dropdown-main-row">
                            <div className={`dropdown-main-item ${activeSubMenu === 'offlineTools' || activeSubMenu === 'registration' || activeSubMenu === 'payments' || activeSubMenu === 'userServices' || activeSubMenu === 'refunds' || activeSubMenu === 'eway' || activeSubMenu === 'track' ? 'active' : 'active'}`} onMouseEnter={() => setActiveSubMenu('offlineTools')}>Offline Tools</div>
                            <div className={`dropdown-main-item ${activeSubMenu === 'gstStatistics' ? 'active' : ''}`} onMouseEnter={() => setActiveSubMenu('gstStatistics')}>GST Statistics</div>
                        </div>
                        {activeSubMenu !== 'gstStatistics' && (
                            <div className="dropdown-sub-row" style={{ alignItems: 'start' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <Link to="/download/returns" onClick={() => setActiveDropdown(null)}>Returns Offline Tool</Link>
                                    <Link to="/download/trans1b" onClick={() => setActiveDropdown(null)}>Tran-1 Offline Tools</Link>
                                    <Link to="/download/gstr3b" onClick={() => setActiveDropdown(null)}>GSTR3B Offline Utility</Link>
                                    <Link to="/download/itc03" onClick={() => setActiveDropdown(null)}>ITC03 Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GST ARA 01 - Application for Advance Ruling</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR 6 Offline Tool With Amendments</Link>
                                    <Link to="/download/gstr7" onClick={() => setActiveDropdown(null)}>GSTR7 Offline Utility</Link>
                                    <Link to="/download/srm1" onClick={() => setActiveDropdown(null)}>SRM-I Offline Tool</Link>
                                    <Link to="/download/gstr10" onClick={() => setActiveDropdown(null)}>GSTR10 Offline Tool</Link>
                                    <Link to="/download/gstr9a" onClick={() => setActiveDropdown(null)}>GSTR-9A Offline Tool</Link>
                                    <Link to="/download/gstr4x" onClick={() => setActiveDropdown(null)}>GSTR-4 Offline Tool (Annual)</Link>
                                    <Link to="/download/ims" onClick={() => setActiveDropdown(null)}>IMS Offline Tool</Link>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <Link to="/download/gstr2b" onClick={() => setActiveDropdown(null)}>Matching Offline Tool</Link>
                                    <Link to="/download/trans2" onClick={() => setActiveDropdown(null)}>Tran-2 Offline Tools</Link>
                                    <Link to="/download/itc01" onClick={() => setActiveDropdown(null)}>ITC01 Offline Tool</Link>
                                    <Link to="/download/itc04" onClick={() => setActiveDropdown(null)}>ITC04 Offline Tool</Link>
                                    <Link to="/download/gstr4/offline" onClick={() => setActiveDropdown(null)}>GSTR-4 Offline Tool (Quarterly filing)</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GSTR 11 Offline Tool</Link>
                                    <Link to="/download/gstr8" onClick={() => setActiveDropdown(null)}>GSTR8 Offline Tool</Link>
                                    <Link to="/download/srm2" onClick={() => setActiveDropdown(null)}>SRM-II Offline Tool</Link>
                                    <Link to="/download/gstr9" onClick={() => setActiveDropdown(null)}>GSTR-9 Offline Tool</Link>
                                    <Link to="/download/gstr9c" onClick={() => setActiveDropdown(null)}>GSTR-9C Offline Tool</Link>
                                    <Link to="#" onClick={() => setActiveDropdown(null)}>GST DRC-22A - Application for Objection to Provisional Attachment Order</Link>
                                    <Link to="/download/gstr2x" onClick={() => setActiveDropdown(null)}>TDS & TCS Credit Received Offline Tool</Link>
                                </div>
                            </div>
                        )}
                        {activeSubMenu === 'gstStatistics' && (
                            <div className="dropdown-sub-row">
                                <Link to="/gst-statistics" onClick={() => setActiveDropdown(null)}>GST Statistics</Link>
                            </div>
                        )}
                    </div>
                )}

                {activeDropdown === 'searchTaxpayer' && (
                    <div 
                        className="dropdown-panel" 
                        onMouseEnter={() => setActiveDropdown('searchTaxpayer')}
                        onMouseLeave={() => setActiveDropdown(null)}
                    >
                        <div className="dropdown-main-row" style={{ background: '#fff', padding: '14px 22px', gap: '34px' }}>
                            <Link to="/search-taxpayer/gstin" style={{ color: '#001b5c', textDecoration: 'none', fontWeight: '500' }} onClick={() => setActiveDropdown(null)}>Search by GSTIN/UIN</Link>
                            <Link to="/search-taxpayer/pan" style={{ color: '#001b5c', textDecoration: 'none', fontWeight: '500' }} onClick={() => setActiveDropdown(null)}>Search by PAN</Link>
                            <Link to="/search-taxpayer/temp-id" style={{ color: '#001b5c', textDecoration: 'none', fontWeight: '500' }} onClick={() => setActiveDropdown(null)}>Search Temporary ID</Link>
                            <Link to="/search-taxpayer/composition" style={{ color: '#001b5c', textDecoration: 'none', fontWeight: '500' }} onClick={() => setActiveDropdown(null)}>Search Composition Taxpayer</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Page Content */}
            <main style={isDashboard ? { padding: 0, margin: 0 } : {}}>
                {children}
            </main>

            {/* Footer */}
            {!isDashboard && (
                <footer className="footer">
                    <div className="footer-top">
                        <div className="footer-grid">
                            <div className="footer-col">
                                <h3>About GST</h3>
                                <ul>
                                    <li><a href="#">GST Council Structure</a></li>
                                    <li><a href="#">GST History</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h3>Website Policies</h3>
                                <ul>
                                    <li><a href="#">Website Policy</a></li>
                                    <li><a href="#">Terms and Conditions</a></li>
                                    <li><a href="#">Hyperlink Policy</a></li>
                                    <li><a href="#">Disclaimer</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h3>Related Sites</h3>
                                <ul>
                                    <li><a href="#">Central Board of Indirect Taxes and Customs</a></li>
                                    <li><a href="#">State Tax Websites</a></li>
                                    <li><a href="#">National Portal</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h3>Help and Taxpayer Facilities</h3>
                                <ul>
                                    <li><a href="#">System Requirements</a></li>
                                    <li><a href="#">GST Knowledge Portal</a></li>
                                    <li><a href="#">GST Media</a></li>
                                    <li><a href="#">Site Map</a></li>
                                    <li><a href="#">Grievance Nodal Officers</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h3>Contact Us</h3>
                                <ul>
                                    <li><a href="#">Help Desk Number:</a></li>
                                    <li className="contact-bold">1800-103-4786</li>
                                    <li className="social-links">
                                        <a href="#" className="social-icon">f</a>
                                        <a href="#" className="social-icon">t</a>
                                        <a href="#" className="social-icon">yt</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 Goods and Services Tax Network</p>
                        <p className="footer-design">Designed and Developed by GSTN</p>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Layout;
