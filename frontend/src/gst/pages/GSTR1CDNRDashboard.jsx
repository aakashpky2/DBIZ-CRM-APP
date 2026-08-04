import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1Dashboard.css'; // Reusing info block and basic styles
import './GSTR1CDNRDashboard.css'; // Specific styles for this page
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';

const GSTR1CDNRDashboard = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);


    const handleRefresh = () => {
        setIsLoading(true);
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await gstr1Service.getGstr1Records('gstr1_cdnr_invoices', trn);

                if (res.success && res.data) {
                    setInvoices(res.data);
                } else {
                    setInvoices([]);
                }
            } catch (error) {
                console.error("Failed to fetch CDNR invoices", error);
                setError(error.message || "Failed to fetch data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const groupedInvoices = Object.values(invoices.reduce((acc, inv) => {
        const gstin = inv.recipient_gstin || 'Unknown';
        if (!acc[gstin]) {
            acc[gstin] = {
                recipientGstin: gstin,
                noteCount: 0,
                taxableValue: 0,
                integratedTax: 0,
                centralTax: 0,
                stateTax: 0,
                cess: 0
            };
        }
        
        acc[gstin].noteCount += 1;
        
        const items = inv.tax_items || [];
        items.forEach(item => {
            acc[gstin].taxableValue += parseFloat(item.taxableValue || item.taxable_value || 0);
            acc[gstin].integratedTax += parseFloat(item.integratedTax || item.integrated_tax || 0);
            acc[gstin].centralTax += parseFloat(item.centralTax || item.central_tax || 0);
            acc[gstin].stateTax += parseFloat(item.stateTax || item.state_tax || 0);
            acc[gstin].cess += parseFloat(item.cess || 0);
        });
        
        return acc;
    }, {}));

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6' }}>
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#167dc2' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>CDNR</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="cdnr-main-content">
                {/* Cyan Header Banner */}
                <div className="cdnr-header-banner">
                    <div className="cdnr-header-flex">
                        <h2 className="cdnr-title">9B - Credit / Debit Notes (Registered)</h2>
                        <div className="cdnr-header-actions">
                            <button className="cdnr-btn-secondary">HELP <span style={{ fontSize: '11px', border: '1px solid #fff', borderRadius: '50%', padding: '0 3px', marginLeft: '3px' }}>?</span></button>
                            <button className="cdnr-refresh-icon" onClick={handleRefresh}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="cdnr-tab-bar">
                        <div className="cdnr-tab active">Recipient wise count</div>
                    </div>
                </div>

                {/* Dashboard Box */}
                <div className="cdnr-dashboard-body">
                    {isLoading ? (
                        <div className="cdnr-loading">Loading...</div>
                    ) : invoices.length === 0 ? (
                        <div className="cdnr-empty-alert">
                            <span>No Credit / Debit Notes (Registered) found for the selected return period.</span>
                            <span className="close-alert">×</span>
                        </div>
                    ) : (
                        <div className="cdnr-table-container">
                            <table className="cdnr-records-table">
                                <thead>
                                    <tr>
                                        <th>Recipient GSTIN</th>
                                        <th>Note Count</th>
                                        <th>Taxable Value (₹)</th>
                                        <th>Integrated Tax (₹)</th>
                                        <th>Central Tax (₹)</th>
                                        <th>State Tax (₹)</th>
                                        <th>Cess (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedInvoices.map((group, idx) => (
                                        <tr key={idx}>
                                            <td>{group.recipientGstin}</td>
                                            <td>{group.noteCount}</td>
                                            <td>₹{group.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td>₹{group.integratedTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td>₹{group.centralTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td>₹{group.stateTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td>₹{group.cess.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="cdnr-actions-row">
                        <button className="cdnr-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                        <button className="cdnr-btn-primary" onClick={() => navigate('/returns/gstr1/cdnr/add')}>ADD RECORD</button>
                    </div>
                </div>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            {/* Footer Bar */}
            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 24-01-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>
        </div>
    );
};

export default GSTR1CDNRDashboard;
