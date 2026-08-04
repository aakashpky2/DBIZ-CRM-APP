import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2ATCSCredits.css';

const GSTR2ATCSCredits = () => {
    const navigate = useNavigate();
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

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

                // Mock Fetch TCS Credits
                const mockCredits = [];
                /*
                const mockCredits = [
                    { id: 1, collectorGstin: '07AAACA1234A1Z5', collectorName: 'TCS CORP', grossValue: '50000.00', taxCollected: '500.00', igstCredit: '500.00', cgstCredit: '0.00', sgstCredit: '0.00', returnPeriod: 'Mar-2026', filingStatus: 'Filed' },
                ];
                */
                
                setCredits(mockCredits);
            } catch (err) {
                console.warn('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Pagination Logic
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = credits.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(credits.length / recordsPerPage);

    const downloadCSV = () => {
        if (credits.length === 0) return;
        
        const headers = ['Collector GSTIN', 'Collector Name', 'Gross Value', 'Tax Collected', 'IGST Credit', 'CGST Credit', 'SGST Credit', 'Return Period', 'Filing Status'];
        
        const csvRows = credits.map(c => [
            c.collectorGstin,
            c.collectorName,
            c.grossValue,
            c.taxCollected,
            c.igstCredit,
            c.cgstCredit,
            c.sgstCredit,
            c.returnPeriod,
            c.filingStatus
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'TCS_Credits.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="tcs-container">
            {/* Breadcrumb Bar */}
            <div className="tcs-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <Link to="/returns/gstr2a">GSTR2A</Link>
                <span>&gt;</span>
                <span>TCS Credits</span>
            </div>

            <div className="tcs-card">
                <h2 className="tcs-title">TCS Credit Received-Summary</h2>

                {/* Taxpayer Details Header */}
                <div className="tcs-taxpayer-details">
                    <div className="tp-row">
                        <div className="tp-item"><strong>GSTIN:</strong> {taxpayerInfo.gstin}</div>
                        <div className="tp-item"><strong>Legal Name:</strong> {taxpayerInfo.legalName}</div>
                        <div className="tp-item"><strong>Trade Name:</strong> {taxpayerInfo.tradeName}</div>
                    </div>
                    <div className="tp-row">
                        <div className="tp-item"><strong>Financial Year:</strong> {taxpayerInfo.financialYear}</div>
                        <div className="tp-item"><strong>Return Period:</strong> {taxpayerInfo.returnPeriod}</div>
                    </div>
                </div>

                {!loading && credits.length === 0 ? (
                    /* Empty State Alert */
                    <div className="tcs-alert-info">
                        <span className="info-icon">ℹ</span>
                        <span>No document found for the provided Inputs.</span>
                    </div>
                ) : (
                    /* Data Table */
                    <div className="tcs-table-wrapper">
                        <table className="tcs-table">
                            <thead>
                                <tr>
                                    <th>Collector GSTIN</th>
                                    <th>Collector Name</th>
                                    <th>Gross Value</th>
                                    <th>Tax Collected</th>
                                    <th>IGST Credit</th>
                                    <th>CGST Credit</th>
                                    <th>SGST Credit</th>
                                    <th>Return Period</th>
                                    <th>Filing Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((c, index) => (
                                    <tr key={index}>
                                        <td>{c.collectorGstin}</td>
                                        <td>{c.collectorName}</td>
                                        <td>{c.grossValue}</td>
                                        <td>{c.taxCollected}</td>
                                        <td>{c.igstCredit}</td>
                                        <td>{c.cgstCredit}</td>
                                        <td>{c.sgstCredit}</td>
                                        <td>{c.returnPeriod}</td>
                                        <td>{c.filingStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="tcs-pagination">
                                <button 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Previous
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button 
                                    disabled={currentPage === totalPages} 
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="tcs-actions">
                    <button className="tcs-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                    <button 
                        className={`tcs-btn-download ${credits.length === 0 ? 'disabled' : ''}`} 
                        onClick={downloadCSV}
                        disabled={credits.length === 0}
                    >
                        DOWNLOAD DOCUMENTS (CSV)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GSTR2ATCSCredits;
