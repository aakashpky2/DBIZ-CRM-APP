import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1CDNRDashboard.css'; // Reusing layout styles
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';

const GSTR1AdvTaxDashboard = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleRefresh = () => {
        setIsLoading(true);
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await gstr1Service.getGstr1Records('gstr1_adv_tax', trn);

                if (res.success && res.data) {
                    setRecords(res.data);
                } else {
                    setRecords([]);
                }
            } catch (error) {
                console.error("Failed to fetch Advance Tax records");
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const groupedRecords = Object.values(records.reduce((acc, rec) => {
        const pos = rec.pos || 'Unknown';
        if (!acc[pos]) {
            acc[pos] = {
                pos: pos,
                supplyType: rec.supply_type || rec.supplyType,
                grossAdvance: 0,
                integratedTax: 0,
                centralTax: 0,
                stateTax: 0,
                cess: 0
            };
        }
        
        acc[pos].grossAdvance += parseFloat(rec.gross_advance_received || 0);
        acc[pos].integratedTax += parseFloat(rec.integrated_tax || 0);
        acc[pos].centralTax += parseFloat(rec.central_tax || 0);
        acc[pos].stateTax += parseFloat(rec.state_ut_tax || 0);
        acc[pos].cess += parseFloat(rec.cess || 0);
        
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
                    <span style={{ color: '#4b5563' }}>Tax Liability (Advances Received)</span>
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
                        <h2 className="cdnr-title">11A(1), 11A(2) - Tax Liability (Advances Received)</h2>
                        <div className="cdnr-header-actions">
                            <button className="cdnr-refresh-icon" onClick={handleRefresh}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Box */}
                <div className="cdnr-dashboard-body">
                    {isLoading ? (
                        <div className="cdnr-loading">Loading...</div>
                    ) : groupedRecords.length === 0 ? (
                        <div className="cdnr-empty-alert">
                            <span>No Tax Liability (Advances Received) records found for the selected return period.</span>
                        </div>
                    ) : (
                        <div className="cdnr-table-container">
                            <div style={{ padding: '10px 15px', backgroundColor: '#e0f2fe', borderBottom: '1px solid #bae6fd', fontSize: '14px', fontWeight: '500', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <span>Total Records: {groupedRecords.length}</span>
                                <span>Total Gross Advance Received: ₹{groupedRecords.reduce((sum, r) => sum + r.grossAdvance, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span>Total IGST: ₹{groupedRecords.reduce((sum, r) => sum + r.integratedTax, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span>Total CGST: ₹{groupedRecords.reduce((sum, r) => sum + r.centralTax, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span>Total SGST: ₹{groupedRecords.reduce((sum, r) => sum + r.stateTax, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span>Total CESS: ₹{groupedRecords.reduce((sum, r) => sum + r.cess, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <table className="cdnr-records-table">
                                <thead>
                                    <tr>
                                        <th>Place Of Supply</th>
                                        <th>Supply Type</th>
                                        <th>Gross Advance Received (₹)</th>
                                        <th>Integrated Tax (₹)</th>
                                        <th>Central Tax (₹)</th>
                                        <th>State/UT Tax (₹)</th>
                                        <th>Cess (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedRecords.map((rec, idx) => (
                                        <tr key={idx}>
                                            <td>{rec.pos}</td>
                                            <td>{rec.supplyType}</td>
                                            <td>₹{rec.grossAdvance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td>₹{rec.integratedTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td>₹{rec.centralTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td>₹{rec.stateTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td>₹{rec.cess.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="cdnr-actions-row">
                        <button className="cdnr-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                        <button className="cdnr-btn-primary" onClick={() => navigate('/returns/gstr1/advtax/add')}>ADD STATE WISE DETAILS</button>
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

export default GSTR1AdvTaxDashboard;
