import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2AAmendmentsISDCredits.css';

const GSTR2AAmendmentsISDCredits = () => {
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
                    { id: 1, isdGstin: '07AAACA1234A1Z5', isdName: 'ISD CORP', originalInvoiceNum: 'ISD-INV-101', revisedInvoiceNum: 'ISD-INV-101-R', invoiceDate: '15/03/2026', docType: 'Invoice', originalCredit: '700.00', amendedCredit: '720.00', igstCredit: '720.00', cgstCredit: '0.00', sgstCredit: '0.00', cessCredit: '0.00', filingStatus: 'Filed' },
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
        
        const headers = ['ISD GSTIN', 'ISD Name', 'Original Invoice Number', 'Revised Invoice Number', 'Invoice Date', 'Document Type', 'Original Credit Amount', 'Amended Credit Amount', 'IGST Credit', 'CGST Credit', 'SGST Credit', 'Cess Credit', 'Filing Status'];
        
        const csvRows = credits.map(c => [
            c.isdGstin,
            c.isdName,
            c.originalInvoiceNum,
            c.revisedInvoiceNum,
            c.invoiceDate,
            c.docType,
            c.originalCredit,
            c.amendedCredit,
            c.igstCredit,
            c.cgstCredit,
            c.sgstCredit,
            c.cessCredit,
            c.filingStatus
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Amended_ISD_Credits.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="amisd-container">
            {/* Breadcrumb Bar */}
            <div className="amisd-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <Link to="/returns/gstr2a">GSTR2A</Link>
                <span>&gt;</span>
                <span>Amendments to ISD Credits</span>
            </div>

            <div className="amisd-card">
                <h2 className="amisd-title">Amended ISD Invoices-Supplier Details</h2>

                {/* Taxpayer Details Header */}
                <div className="amisd-taxpayer-details">
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
                    <div className="amisd-alert-info">
                        <span className="info-icon">ℹ</span>
                        <span>No document found for the provided Inputs.</span>
                    </div>
                ) : (
                    /* Data Table */
                    <div className="amisd-table-wrapper">
                        <table className="amisd-table">
                            <thead>
                                <tr>
                                    <th>ISD GSTIN</th>
                                    <th>ISD Name</th>
                                    <th>Original Invoice Number</th>
                                    <th>Revised Invoice Number</th>
                                    <th>Invoice Date</th>
                                    <th>Document Type</th>
                                    <th>Original Credit Amount</th>
                                    <th>Amended Credit Amount</th>
                                    <th>IGST Credit</th>
                                    <th>CGST Credit</th>
                                    <th>SGST Credit</th>
                                    <th>Cess Credit</th>
                                    <th>Filing Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((c, index) => (
                                    <tr key={index}>
                                        <td>{c.isdGstin}</td>
                                        <td>{c.isdName}</td>
                                        <td>{c.originalInvoiceNum}</td>
                                        <td>{c.revisedInvoiceNum}</td>
                                        <td>{c.invoiceDate}</td>
                                        <td>{c.docType}</td>
                                        <td>{c.originalCredit}</td>
                                        <td>{c.amendedCredit}</td>
                                        <td>{c.igstCredit}</td>
                                        <td>{c.cgstCredit}</td>
                                        <td>{c.sgstCredit}</td>
                                        <td>{c.cessCredit}</td>
                                        <td>{c.filingStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="amisd-pagination">
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
                <div className="amisd-actions">
                    <button className="amisd-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                    <button 
                        className={`amisd-btn-download ${credits.length === 0 ? 'disabled' : ''}`} 
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

export default GSTR2AAmendmentsISDCredits;
