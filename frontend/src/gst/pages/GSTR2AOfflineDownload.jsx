import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2AOfflineDownload.css';

const GSTR2AOfflineDownload = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [taxpayerInfo, setTaxpayerInfo] = useState({
        gstin: '...',
        legalName: '...',
        tradeName: '...',
        financialYear: '2025-26',
        returnPeriod: 'March'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Details
                const userRes = await api.get('/auth/me');
                if (userRes.data?.success && userRes.data?.data) {
                    const user = userRes.data.data;
                    setTaxpayerInfo(prev => ({
                        ...prev,
                        gstin: user.gstin || localStorage.getItem('gst_trn') || '32AAICD8127A1Z4',
                        legalName: user.legal_name || 'GST USER',
                        tradeName: user.trade_name || 'GST USER TRADE'
                    }));
                }
            } catch (err) {
                console.warn('Failed to fetch data', err);
            }
        };
        fetchData();
    }, []);

    const generateJSON = () => {
        setLoading(true);
        setTimeout(() => {
            const data = {
                gstin: taxpayerInfo.gstin,
                fp: taxpayerInfo.returnPeriod + taxpayerInfo.financialYear,
                b2b: [],
                cdn: [],
                isd: [],
                tds: [],
                tcs: [],
                boe: []
            };
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `GSTR2A_${taxpayerInfo.gstin}_${taxpayerInfo.returnPeriod}.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setLoading(false);
        }, 1000);
    };

    const generateExcel = () => {
        setLoading(true);
        setTimeout(() => {
            const csvContent = "Invoice Number,Invoice Date,Supplier GSTIN,Supplier Name,Taxable Value,IGST,CGST,SGST,Cess\nNo records available for export.";
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `GSTR2A_${taxpayerInfo.gstin}_${taxpayerInfo.returnPeriod}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="offdown-container">
            {/* Breadcrumb Bar */}
            <div className="offdown-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <span>GSTR</span>
            </div>

            <div className="offdown-card">
                <div className="offdown-header-row">
                    <h2 className="offdown-title">Offline Download for</h2>
                    <button className="offdown-refresh-btn" onClick={() => window.location.reload()}>
                        ↻ REFRESH
                    </button>
                </div>

                {/* Help Section */}
                <div className="offdown-help-section">
                    <p>Inward supplies details in GSTR-2A, auto drafted on the basis of GSTR-1/IFF/1A/5/6/7/8, can be downloaded as either Json file to view in offline tool or can be downloaded as Excel file.</p>
                </div>

                {/* Center Download Action Box */}
                <div className="offdown-center-box">
                    <h3>Download data for GSTR2A</h3>
                    <p className="offdown-note">Please refer help section for more details.</p>
                    
                    <div className="offdown-buttons-group">
                        <button 
                            className="offdown-btn-primary" 
                            onClick={generateJSON}
                            disabled={loading}
                        >
                            {loading ? 'GENERATING...' : 'GENERATE JSON FILE TO DOWNLOAD'}
                        </button>
                        <button 
                            className="offdown-btn-primary" 
                            onClick={generateExcel}
                            disabled={loading}
                        >
                            {loading ? 'GENERATING...' : 'GENERATE EXCEL FILE TO DOWNLOAD'}
                        </button>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="offdown-actions">
                    <button className="offdown-btn-back" onClick={() => navigate('/returns-dashboard')}>BACK</button>
                </div>
            </div>
        </div>
    );
};

export default GSTR2AOfflineDownload;
