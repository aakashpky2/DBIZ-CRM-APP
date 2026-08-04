import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './ReturnsDashboard.css';

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

const ReturnsDashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const toggleMenu = (menu) => {
        setActiveMenu(prev => (prev === menu ? null : menu));
    };

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    return (
        <div className="dashboard-container" onClick={handleBackdropClick}>

            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link> <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span> <span style={{ color: '#4b5563' }}>Returns</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="returns-main-content">
                <div className="returns-card">
                    <h2 className="returns-title">File Returns</h2>

                    <div className="returns-alert-strip">
                        <span className="scrolling-text">GSTR-1 and GSTR-3B can be filed through SMS.</span>
                    </div>

                    <div className="returns-mandatory-note">
                        <span className="red-dot">•</span> Indicates Mandatory Fields
                    </div>

                    <div className="returns-form-row">
                        <div className="returns-form-group">
                            <label className="returns-label">Financial Year <span className="red-dot">*</span></label>
                            <select className="returns-select">
                                <option>2025-26</option>
                                <option>2024-25</option>
                                <option>2023-24</option>
                                <option>2022-23</option>
                                <option>2021-22</option>
                            </select>
                        </div>
                        <div className="returns-form-group">
                            <label className="returns-label">Quarter <span className="red-dot">*</span></label>
                            <select className="returns-select">
                                <option>Quarter 4 (Jan - Mar)</option>
                                <option>Quarter 1 (Apr - Jun)</option>
                                <option>Quarter 2 (Jul - Sep)</option>
                                <option>Quarter 3 (Oct - Dec)</option>
                            </select>
                        </div>
                        <div className="returns-form-group">
                            <label className="returns-label">Period <span className="red-dot">*</span></label>
                            <select className="returns-select">
                                <option>March</option>
                                <option>January</option>
                                <option>February</option>
                            </select>
                        </div>
                        <div className="returns-form-group returns-btn-align">
                            <button className="returns-search-btn" onClick={() => setShowResults(true)}>SEARCH</button>
                        </div>
                    </div>

                    {showResults && (
                        <div className="returns-results-section">
                            {/* Info Banner */}
                            <div className="returns-info-banner">
                                <div className="returns-info-content">
                                    <span className="info-icon">i</span>
                                    <span>You have selected to file the return on monthly frequency, GSTR-1 and GSTR-3B shall be required to be filed for each month of the quarter.</span>
                                </div>
                                <button className="returns-info-close" onClick={() => setShowResults(false)}>✖</button>
                            </div>

                            {/* Cards container */}
                            <div className="returns-cards-grid">
                                {/* Card 1 */}
                                <div className="returns-result-card">
                                    <div className="returns-card-header">
                                        <h3>Details of outward supplies of goods or services</h3>
                                        <p className="returns-card-subtitle">GSTR1</p>
                                    </div>
                                    <div className="returns-card-body">
                                        <p className="due-date-text">Due Date - 11/04/2026</p>
                                        <div className="returns-card-actions">
                                            <button className="returns-action-btn" onClick={() => navigate('/returns/gstr1')}>PREPARE ONLINE</button>
                                            <button className="returns-action-btn">PREPARE OFFLINE</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="returns-result-card">
                                    <div className="returns-card-header">
                                        <h3>Auto - drafted ITC Statement for the month</h3>
                                        <p className="returns-card-subtitle">GSTR2B</p>
                                    </div>
                                    <div className="returns-card-body">
                                        <div className="returns-card-actions centered-actions">
                                            <button className="returns-action-btn" onClick={() => navigate('/returns/gstr2b/summary?fy=2025-26&month=March')}>VIEW</button>
                                            <button className="returns-action-btn" onClick={() => navigate('/returns/gstr2b/pdf-preview')}>DOWNLOAD</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3 */}
                                <div className="returns-result-card">
                                    <div className="returns-card-header">
                                        <h3>Auto Drafted details (For view only)</h3>
                                        <p className="returns-card-subtitle">GSTR2A</p>
                                    </div>
                                    <div className="returns-card-body">
                                        <div className="returns-card-actions centered-actions">
                                            <button className="returns-action-btn" onClick={() => navigate('/returns/gstr2a')}>VIEW</button>
                                            <button className="returns-action-btn" onClick={() => navigate('/returns/gstr2a/offline-download')}>DOWNLOAD</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
    );
};

export default ReturnsDashboard;
