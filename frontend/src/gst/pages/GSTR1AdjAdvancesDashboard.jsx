import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1CDNRDashboard.css'; // Reusing layout styles
import gstr1Service from '../services/gstr1Service';

const GSTR1AdjAdvancesDashboard = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await gstr1Service.getGstr1Records('gstr1_adj_advances', trn);
                if (res.success && res.data) {
                    setRecords(res.data);
                } else {
                    setRecords([]);
                }
            } catch (error) {
                console.error('Failed to fetch Adjustment of Advances records');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecords();
    }, []);

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
                    <span style={{ color: '#4b5563' }}>Adjustment of Advances</span>
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
                        <h2 className="cdnr-title">11B(1), 11B(2) - Adjustment of Advances</h2>
                        <div className="cdnr-header-actions">
                            <button className="cdnr-refresh-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.5 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Box */}
                <div className="cdnr-dashboard-body">
                    {isLoading ? (
                        <div className="cdnr-loading">Loading...</div>
                    ) : records.length === 0 ? (
                        <div className="cdnr-empty-alert">
                            <span><span style={{ marginRight: '8px', fontWeight: 'bold' }}></span>There are no records to be displayed.</span>
                        </div>
                    ) : (
                        <div className="cdnr-table-container">
                            <table className="cdnr-records-table">
                                <thead>
                                    <tr>
                                        <th>Place Of Supply</th>
                                        <th>Supply Type</th>
                                        <th>Gross Advance Adjusted (₹)</th>
                                        <th>Integrated Tax (₹)</th>
                                        <th>Central Tax (₹)</th>
                                        <th>State/UT Tax (₹)</th>
                                        <th>Cess (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((rec, idx) => {
                                        const gross = rec.gross_advance_adjusted ? parseFloat(rec.gross_advance_adjusted).toFixed(2) : '0.00';
                                        const cess = rec.cess ? parseFloat(rec.cess).toFixed(2) : '0.00';
                                        const integrated = rec.integrated_tax ? parseFloat(rec.integrated_tax).toFixed(2) : '';
                                        const central = rec.central_tax ? parseFloat(rec.central_tax).toFixed(2) : '';
                                        const state = rec.state_ut_tax ? parseFloat(rec.state_ut_tax).toFixed(2) : '';
                                        return (
                                            <tr key={idx}>
                                                <td>{rec.pos}</td>
                                                <td>{rec.supply_type}</td>
                                                <td>{gross}</td>
                                                {rec.supply_type === 'Intra-State' ? (
                                                    <>
                                                        <td></td>
                                                        <td>{central}</td>
                                                        <td>{state}</td>
                                                        <td>{cess}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>{integrated}</td>
                                                        <td></td>
                                                        <td></td>
                                                        <td>{cess}</td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* Bottom Actions */}
                    <div className="cdnr-actions-row">
                        <button className="cdnr-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                        <button className="cdnr-btn-primary" onClick={() => navigate('/returns/gstr1/adjadvances/add')}>ADD STATE WISE DETAILS</button>
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
        </div>
    );
};

export default GSTR1AdjAdvancesDashboard;
