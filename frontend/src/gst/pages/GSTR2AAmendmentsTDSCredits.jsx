import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2AAmendmentsTDSCredits.css';

const GSTR2AAmendmentsTDSCredits = () => {
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

                // Mock Fetch Amendments
                const mockCredits = [];
                /*
                const mockCredits = [
                    { id: 1, deductorGstin: '07AAACA1234A1Z5', deductorName: 'TDS CORP', originalGrossAmt: '50000.00', revisedGrossAmt: '52000.00', originalTaxDeducted: '1000.00', revisedTaxDeducted: '1040.00', igstCredit: '1040.00', cgstCredit: '0.00', sgstCredit: '0.00', returnPeriod: 'Mar-2026', filingStatus: 'Filed' },
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
        
        const headers = ['Deductor GSTIN', 'Deductor Name', 'Original Gross Amount', 'Revised Gross Amount', 'Original Tax Deducted', 'Revised Tax Deducted', 'IGST Credit', 'CGST Credit', 'SGST Credit', 'Return Period', 'Filing Status'];
        
        const csvRows = credits.map(c => [
            c.deductorGstin,
            c.deductorName,
            c.originalGrossAmt,
            c.revisedGrossAmt,
            c.originalTaxDeducted,
            c.revisedTaxDeducted,
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
        link.setAttribute('download', 'Amended_TDS_Credits.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="amtds-container">
            {/* Breadcrumb Bar */}
            <div className="amtds-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <Link to="/returns/gstr2a">GSTR2A</Link>
                <span>&gt;</span>
                <span>Amendments to TDS Credits</span>
            </div>

            <div className="amtds-card">
                <h2 className="amtds-title">Amendments to TDS Credit Recieved - Summary</h2>

                {/* Taxpayer Details Header */}
                <div className="amtds-taxpayer-details">
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
                    <div className="amtds-alert-info">
                        <span className="info-icon">ℹ</span>
                        <span>No document found for the provided Inputs.</span>
                    </div>
                ) : (
                    /* Data Table */
                    <div className="amtds-table-wrapper">
                        <table className="amtds-table">
                            <thead>
                                <tr>
                                    <th>Deductor GSTIN</th>
                                    <th>Deductor Name</th>
                                    <th>Original Gross Amount</th>
                                    <th>Revised Gross Amount</th>
                                    <th>Original Tax Deducted</th>
                                    <th>Revised Tax Deducted</th>
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
                                        <td>{c.deductorGstin}</td>
                                        <td>{c.deductorName}</td>
                                        <td>{c.originalGrossAmt}</td>
                                        <td>{c.revisedGrossAmt}</td>
                                        <td>{c.originalTaxDeducted}</td>
                                        <td>{c.revisedTaxDeducted}</td>
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
                            <div className="amtds-pagination">
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
                <div className="amtds-actions">
                    <button className="amtds-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                    <button 
                        className={`amtds-btn-download ${credits.length === 0 ? 'disabled' : ''}`} 
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

export default GSTR2AAmendmentsTDSCredits;
