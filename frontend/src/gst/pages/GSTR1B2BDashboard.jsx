import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1Dashboard.css'; // Reusing info block and basic styles
import './GSTR1B2BDashboard.css'; // Specific styles for this page
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';

const GSTR1B2BDashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchB2BInvoices = async () => {
        setLoading(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const res = await gstr1Service.getGstr1Records('gstr1_b2b_invoices', trn);
            if (res.success && res.data) {
                setInvoices(res.data);
            } else {
                setInvoices([]);
            }
        } catch (error) {
            console.error('Failed to fetch B2B invoices');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchB2BInvoices();
    }, []);


    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

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
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#3b82f6' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>B2B</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="gstr1-main-content b2b-main-content">
                {/* Info Block (No Dropdown variant) */}
                <div className="b2b-info-block">
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
                </div>

                {/* Cyan Header Banner */}
                <div className="b2b-header-banner">
                    <div className="b2b-header-top">
                        <h2 className="b2b-title">4A, 4B, 6B, 6C - B2B, SEZ, DE Invoices</h2>
                        <div className="gstr1-header-actions">
                            <button className="gstr1-btn-secondary">HELP <span style={{ fontSize: '12px', border: '1px solid #fff', borderRadius: '50%', padding: '0 4px', marginLeft: '4px' }}>?</span></button>
                            <button className="gstr1-btn-icon" onClick={fetchB2BInvoices}>↻</button>
                        </div>
                    </div>

                    <div className="b2b-header-tabs">
                        <div className="b2b-tab active">Recipient wise count</div>
                    </div>
                </div>

                {/* Dynamic Records Box */}
                {loading ? (
                    <div className="b2b-empty-records" style={{ textAlign: 'center' }}>Loading...</div>
                ) : (
                    <div className="b2b-records-table-container">
                        <table className="b2b-records-table">
                            <thead>
                                <tr>
                                    <th>Recipient GSTIN/UIN</th>
                                    <th>Recipient Name</th>
                                    <th>Invoice No.</th>
                                    <th>Invoice Date</th>
                                    <th>Total Invoice Value (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length > 0 ? (
                                    invoices.map((inv, idx) => (
                                        <tr key={inv.id || idx}>
                                            <td>{inv.recipient_gstin}</td>
                                            <td>{inv.recipient_name || '-'}</td>
                                            <td>{inv.invoice_no}</td>
                                            <td>{inv.invoice_date}</td>
                                            <td>{inv.total_invoice_value}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">No records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                    


                {/* Bottom Actions */}
                <div className="b2b-actions-row">
                    <button className="b2b-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                    <button className="b2b-btn-primary" onClick={() => navigate('/returns/gstr1/b2b/add')}>ADD RECORD</button>
                    <button className="b2b-btn-primary">IMPORT EWB DATA</button>
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

export default GSTR1B2BDashboard;
