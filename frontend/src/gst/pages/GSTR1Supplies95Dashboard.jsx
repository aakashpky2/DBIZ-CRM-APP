import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1Supplies95Dashboard.css';
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import toast from 'react-hot-toast';

const GSTR1Supplies95Dashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'R2R'); // R2R, R2NR, NR2R, NR2NR
    const [isLoading, setIsLoading] = useState(true);
    const [records, setRecords] = useState([]);

    const tabs = [
        { id: 'R2R', label: 'Registered to Registered' },
        { id: 'R2NR', label: 'Registered to Unregistered' },
        { id: 'NR2R', label: 'Unregistered to Registered' },
        { id: 'NR2NR', label: 'Unregistered to Unregistered' }
    ];

    useEffect(() => {
        fetchRecords();
    }, [activeTab]);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const res = await gstr1Service.getGstr1Records('gstr1_sup95', trn);

                if (res.success && res.data) {
                    setRecords(res.data);
                } else {
                    setRecords([]);
                }
            } catch (error) {
            console.error("Failed to fetch 9(5) records");
        } finally {
            setIsLoading(false);
        }
    };

    const getRecordTaxableValue = (rec) => {
        if (rec.itemDetails && Array.isArray(rec.itemDetails)) {
            const sum = rec.itemDetails.reduce((acc, item) => acc + parseFloat(item.taxableValue || 0), 0);
            if (sum > 0) return sum.toFixed(2);
        }
        return parseFloat(rec.taxableValue || rec.totalValue || 0).toFixed(2);
    };

    const getRecordTaxAmount = (rec, field) => {
        if (rec.itemDetails && Array.isArray(rec.itemDetails) && rec.itemDetails.length > 0) {
            const sum = rec.itemDetails.reduce((acc, item) => acc + parseFloat(item[field] || 0), 0);
            if (sum > 0) return sum.toFixed(2);
        }
        return parseFloat(rec[field] || 0).toFixed(2);
    };

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6' }}>
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                    <span className="breadcrumb-sep">&gt;</span>
                    <Link to="/returns-dashboard" className="breadcrumb-link">Returns</Link>
                    <span className="breadcrumb-sep">&gt;</span>
                    <Link to="/returns/gstr1" className="breadcrumb-link">GSTR-1/IFF</Link>
                    <span className="breadcrumb-sep">&gt;</span>
                    <span className="breadcrumb-current">Supplies U/s 9(5)</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>
 
            <div className="sup95-main-content">
                <div className="sup95-header-banner">
                    <div className="sup95-header-flex">
                        <h2 className="sup95-title">15 - Supplies U/s 9(5)</h2>
                        <div className="sup95-header-actions">
                            <button className="sup95-btn-help">HELP <span>?</span></button>
                            <button className="sup95-refresh-btn">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="sup95-tabs">
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                className={`sup95-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </div>
                        ))}
                    </div>
                </div>
 
                <div className="sup95-body">
                    {records.length === 0 ? (
                        <div className="sup95-empty-alert">
                            There are no records to be displayed.
                        </div>
                    ) : (
                        <div className="sup95-table-wrapper" style={{ border: '1px solid #ddd', marginBottom: '30px' }}>
                            <table className="sup95-records-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                <thead>
                                    <tr style={{ background: '#f1f3f6' }}>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>GSTIN/UIN</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Recipient</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>POS</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Doc No</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Doc Date</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Taxable Value</th>
                                        {true && (
                                            <>
                                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>IGST (₹)</th>
                                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>CGST (₹)</th>
                                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>SGST (₹)</th>
                                                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Cess (₹)</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((rec, i) => (
                                        <tr key={i}>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rec.supplierGstin || 'UR'}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rec.recipientGstin || 'UR'}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rec.pos}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rec.documentNumber || '-'}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{rec.documentDate || '-'}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{getRecordTaxableValue(rec)}</td>
                                            {true && (
                                                <>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{getRecordTaxAmount(rec, 'integratedTax')}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{getRecordTaxAmount(rec, 'centralTax')}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{getRecordTaxAmount(rec, 'stateTax')}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{getRecordTaxAmount(rec, 'cess')}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="sup95-footer-actions">
                        <button className="sup95-btn-back" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                        <button className="sup95-btn-add" onClick={() => navigate(`/returns/gstr1/sup95/add?tab=${activeTab}`)}>ADD RECORD</button>
                    </div>
                </div>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 24-01-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>
        </div>
    );
};

export default GSTR1Supplies95Dashboard;
