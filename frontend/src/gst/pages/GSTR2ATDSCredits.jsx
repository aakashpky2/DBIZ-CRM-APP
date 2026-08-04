import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2ATDSCredits.css';

const GSTR2ATDSCredits = () => {
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

                // Mock Fetch TDS Credits
                const mockCredits = [];
                /*
                const mockCredits = [
                    { id: 1, deductorGstin: '07AAACA1234A1Z5', deductorName: 'TDS CORP', grossAmt: 50000.00, taxDeducted: 1000.00, igstCredit: 1000.00, cgstCredit: 0.00, sgstCredit: 0.00, returnPeriod: 'Mar-2026', filingDate: '15/04/2026', status: 'Filed' },
                    { id: 2, deductorGstin: '09BBBCB2345B2Z6', deductorName: 'XYZ CORP', grossAmt: 25000.00, taxDeducted: 500.00, igstCredit: 0.00, cgstCredit: 250.00, sgstCredit: 250.00, returnPeriod: 'Mar-2026', filingDate: '16/04/2026', status: 'Filed' },
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

    // Summary Calculations
    const totalTdsCredit = credits.reduce((sum, item) => sum + Number(item.taxDeducted || 0), 0);
    const totalIgst = credits.reduce((sum, item) => sum + Number(item.igstCredit || 0), 0);
    const totalCgst = credits.reduce((sum, item) => sum + Number(item.cgstCredit || 0), 0);
    const totalSgst = credits.reduce((sum, item) => sum + Number(item.sgstCredit || 0), 0);

    const downloadCSV = () => {
        if (credits.length === 0) return;
        
        const headers = ['Deductor GSTIN', 'Deductor Name', 'Gross Amount Paid', 'Tax Deducted', 'IGST Credit', 'CGST Credit', 'SGST Credit', 'Return Period', 'Filing Date', 'Status'];
        
        const csvRows = credits.map(c => [
            c.deductorGstin,
            c.deductorName,
            c.grossAmt,
            c.taxDeducted,
            c.igstCredit,
            c.cgstCredit,
            c.sgstCredit,
            c.returnPeriod,
            c.filingDate,
            c.status
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'TDS_Credits.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="tds-container">
            {/* Breadcrumb Bar */}
            <div className="tds-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <Link to="/returns/gstr2a">GSTR2A</Link>
                <span>&gt;</span>
                <span>TDS Credits</span>
            </div>

            <div className="tds-card">
                <h2 className="tds-title">TDS Credit Received - Summary</h2>

                {/* Taxpayer Details Header */}
                <div className="tds-taxpayer-details">
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
                    <div className="tds-alert-info">
                        <span className="info-icon">ℹ</span>
                        <span>No document found for the provided Inputs.</span>
                    </div>
                ) : (
                    /* Data Table */
                    <div className="tds-table-wrapper">
                        <table className="tds-table">
                            <thead>
                                <tr>
                                    <th>Deductor GSTIN</th>
                                    <th>Deductor Name</th>
                                    <th>Gross Amount Paid</th>
                                    <th>Tax Deducted</th>
                                    <th>IGST Credit</th>
                                    <th>CGST Credit</th>
                                    <th>SGST Credit</th>
                                    <th>Return Period</th>
                                    <th>Filing Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((c, index) => (
                                    <tr key={index}>
                                        <td>{c.deductorGstin}</td>
                                        <td>{c.deductorName}</td>
                                        <td>{Number(c.grossAmt).toFixed(2)}</td>
                                        <td>{Number(c.taxDeducted).toFixed(2)}</td>
                                        <td>{Number(c.igstCredit).toFixed(2)}</td>
                                        <td>{Number(c.cgstCredit).toFixed(2)}</td>
                                        <td>{Number(c.sgstCredit).toFixed(2)}</td>
                                        <td>{c.returnPeriod}</td>
                                        <td>{c.filingDate}</td>
                                        <td>{c.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                                    <td style={{ fontWeight: 'bold' }}>{totalTdsCredit.toFixed(2)}</td>
                                    <td style={{ fontWeight: 'bold' }}>{totalIgst.toFixed(2)}</td>
                                    <td style={{ fontWeight: 'bold' }}>{totalCgst.toFixed(2)}</td>
                                    <td style={{ fontWeight: 'bold' }}>{totalSgst.toFixed(2)}</td>
                                    <td colSpan="3"></td>
                                </tr>
                            </tfoot>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="tds-pagination">
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
                <div className="tds-actions">
                    <button className="tds-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                    <button 
                        className={`tds-btn-download ${credits.length === 0 ? 'disabled' : ''}`} 
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

export default GSTR2ATDSCredits;
