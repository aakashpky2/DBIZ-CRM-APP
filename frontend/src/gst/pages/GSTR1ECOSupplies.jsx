import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1ECOSupplies.css';

import gstr1Service from '../services/gstr1Service';
import toast from 'react-hot-toast';

const GSTR1ECOSupplies = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'TCS'); // TCS (u/s 52) or PAY (u/s 9(5))
    const [isLoading, setIsLoading] = useState(true);
    const [records, setRecords] = useState([]);

    useEffect(() => {
        fetchRecords();
    }, [activeTab]);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const res = await gstr1Service.getGstr1Records('gstr1_eco', trn);
            const filtered = res.filter(r => r.type === activeTab);
            setRecords(filtered);
        } catch (error) {
            toast.error("Failed to fetch ECO records");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#167dc2' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>Supplies through ECO</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            <div className="eco-main-content">
                <div className="eco-header-banner">
                    <div className="eco-header-flex">
                        <h2 className="eco-title">14 - Supplies made through E-Commerce Operators</h2>
                        <div className="eco-header-actions">
                            <button className="eco-btn-secondary">HELP <span style={{ fontSize: '11px', border: '1px solid #fff', borderRadius: '50%', padding: '0 3px', marginLeft: '3px' }}>?</span></button>
                            <button className="eco-refresh-icon" onClick={fetchRecords}>
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="eco-tabs">
                        <div className={`eco-tab ${activeTab === 'TCS' ? 'active' : ''}`} onClick={() => setActiveTab('TCS')}>
                            Liable to collect tax u/s 52 (TCS)
                        </div>
                        <div className={`eco-tab ${activeTab === 'PAY' ? 'active' : ''}`} onClick={() => setActiveTab('PAY')}>
                            Liable to pay tax u/s 9(5)
                        </div>
                    </div>
                </div>

                <div className="eco-body">
                    {isLoading ? (
                        <div className="eco-empty-alert">Loading records...</div>
                    ) : records.length === 0 ? (
                        <div className="eco-empty-alert">
                            <span>There are no records to be displayed.</span>
                        </div>
                    ) : (
                        <div className="eco-table-wrapper" style={{ border: '1px solid #ddd', marginBottom: '30px' }}>
                            <table className="eco-records-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ background: '#f1f3f6' }}>
                                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>GSTIN/UIN of ECO</th>
                                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>Net Value (₹)</th>
                                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>Integr. Tax (₹)</th>
                                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>Central Tax (₹)</th>
                                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>State Tax (₹)</th>
                                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>Cess (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((rec, i) => (
                                        <tr key={i}>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{rec.gstin}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{rec.netValue}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{rec.integratedTax}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{rec.centralTax}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{rec.stateTax}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{rec.cess || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="eco-action-row">
                        <button className="eco-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                        <button className="eco-btn-primary" onClick={() => navigate(`/returns/gstr1/eco/add?type=${activeTab}`)}>
                            ADD RECORD
                        </button>
                    </div>
                </div>
            </div>

            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 24-01-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>
        </div>
    );
};

export default GSTR1ECOSupplies;
