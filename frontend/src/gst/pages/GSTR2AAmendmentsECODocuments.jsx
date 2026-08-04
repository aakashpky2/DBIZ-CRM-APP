import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2AAmendmentsECODocuments.css';

const GSTR2AAmendmentsECODocuments = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
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
                const mockDocs = [];
                /*
                const mockDocs = [
                    { id: 1, ecoGstin: '07AAACA1234A1Z5', ecoName: 'ECO PLATFORM 1', originalDocNum: 'ECO-INV-001', revisedDocNum: 'ECO-INV-001-R', docType: 'Invoice', docDate: '15/03/2026', taxableValue: '4500.00', igst: '810.00', cgst: '0.00', sgst: '0.00', cess: '0.00', filingStatus: 'Filed' },
                ];
                */
                
                setDocuments(mockDocs);
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
    const currentRecords = documents.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(documents.length / recordsPerPage);

    const downloadCSV = () => {
        if (documents.length === 0) return;
        
        const headers = ['ECO GSTIN', 'ECO Name', 'Original Document Number', 'Revised Document Number', 'Document Type', 'Document Date', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'Cess', 'Filing Status'];
        
        const csvRows = documents.map(d => [
            d.ecoGstin,
            d.ecoName,
            d.originalDocNum,
            d.revisedDocNum,
            d.docType,
            d.docDate,
            d.taxableValue,
            d.igst,
            d.cgst,
            d.sgst,
            d.cess,
            d.filingStatus
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Amended_ECO_Documents.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="ameco-container">
            {/* Breadcrumb Bar */}
            <div className="ameco-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <Link to="/returns/gstr2a">GSTR2A</Link>
                <span>&gt;</span>
                <span>Amendments to ECO Documents</span>
            </div>

            <div className="ameco-card">
                <h2 className="ameco-title">Amended ECO Documents - ECO Details</h2>

                {/* Taxpayer Details Header */}
                <div className="ameco-taxpayer-details">
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

                {!loading && documents.length === 0 ? (
                    /* Empty State Alert */
                    <div className="ameco-alert-info">
                        <span className="info-icon">ℹ</span>
                        <span>No document found for the provided Inputs.</span>
                    </div>
                ) : (
                    /* Data Table */
                    <div className="ameco-table-wrapper">
                        <table className="ameco-table">
                            <thead>
                                <tr>
                                    <th>ECO GSTIN</th>
                                    <th>ECO Name</th>
                                    <th>Original Document Number</th>
                                    <th>Revised Document Number</th>
                                    <th>Document Type</th>
                                    <th>Document Date</th>
                                    <th>Taxable Value</th>
                                    <th>IGST</th>
                                    <th>CGST</th>
                                    <th>SGST</th>
                                    <th>Cess</th>
                                    <th>Filing Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((d, index) => (
                                    <tr key={index}>
                                        <td>{d.ecoGstin}</td>
                                        <td>{d.ecoName}</td>
                                        <td>{d.originalDocNum}</td>
                                        <td>{d.revisedDocNum}</td>
                                        <td>{d.docType}</td>
                                        <td>{d.docDate}</td>
                                        <td>{d.taxableValue}</td>
                                        <td>{d.igst}</td>
                                        <td>{d.cgst}</td>
                                        <td>{d.sgst}</td>
                                        <td>{d.cess}</td>
                                        <td>{d.filingStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="ameco-pagination">
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
                <div className="ameco-actions">
                    <button className="ameco-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                    <button 
                        className={`ameco-btn-download ${documents.length === 0 ? 'disabled' : ''}`} 
                        onClick={downloadCSV}
                        disabled={documents.length === 0}
                    >
                        DOWNLOAD DOCUMENTS (CSV)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GSTR2AAmendmentsECODocuments;
