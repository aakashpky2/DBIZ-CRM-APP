import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1Dashboard.css'; // Reusing info block and basic styles
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import PageLoader from '../components/PageLoader';

const GSTR1NilRatedDashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleRefresh = () => {
        setLoading(true);
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await gstr1Service.getGstr1Records('gstr1_nil_rated_supplies', trn);

                if (res.success && res.data) {
                    setInvoices(res.data);
                } else {
                    setInvoices([]);
                }
            } catch (error) {
                console.error("Failed to fetch Nil Rated supplies");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

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
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#3b82f6' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>NIL</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="gstr1-main-content nilrated-main-content">
                {/* Cyan Header Banner */}
                <div className="nilrated-header-banner">
                    <div className="nilrated-header-top">
                        <h2 className="nilrated-title">8A, 8B, 8C, 8D - Nil Rated Supplies</h2>
                        <div className="gstr1-header-actions">
                            <button className="gstr1-btn-secondary">HELP <span style={{ fontSize: '12px', border: '1px solid #fff', borderRadius: '50%', padding: '0 4px', marginLeft: '4px' }}>?</span></button>
                            <button className="gstr1-btn-icon" onClick={handleRefresh}>↻</button>
                        </div>
                    </div>
                </div>

                {/* Dynamic Records Box */}
                {loading ? (
                    <div className="nilrated-empty-records" style={{ textAlign: 'center' }}>Loading...</div>
                ) : invoices.length === 0 ? (
                    <div className="nilrated-empty-records">
                        There are no records to be displayed.
                    </div>
                ) : (
                    <div className="nilrated-records-table-container">
                        <table className="nilrated-records-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Nil Rated Supplies (₹)</th>
                                    <th>Exempted (other than nil rated/non GST supply) (₹)</th>
                                    <th>Non-GST supplies (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                    {invoices.map((inv, idx) => (
                                        <tr key={inv.id || idx}>
                                            <td>{inv.description}</td>
                                            <td>{inv.nilRated || '0.00'}</td>
                                            <td>{inv.exempted || '0.00'}</td>
                                            <td>{inv.nonGst || '0.00'}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="nilrated-actions-row">
                    <button className="nilrated-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                    <button className="nilrated-btn-primary" onClick={() => navigate('/returns/gstr1/nilrated/add')}>EDIT</button>
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

export default GSTR1NilRatedDashboard;
