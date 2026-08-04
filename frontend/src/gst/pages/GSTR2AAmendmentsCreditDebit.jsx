import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2AAmendmentsCreditDebit.css';

const GSTR2AAmendmentsCreditDebit = () => {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
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
                const mockNotes = [];
                /*
                const mockNotes = [
                    { id: 1, supplierGstin: '07AAACA1234A1Z5', supplierName: 'ABC CORP', originalNoteNum: 'CN-101', revisedNoteNum: 'CN-101-R', noteType: 'Credit', noteDate: '15/03/2026', noteValue: '5500.00', taxableValue: '4500.00', igst: '810.00', cgst: '0.00', sgst: '0.00', cess: '0.00', filingStatus: 'Filed' },
                ];
                */
                
                setNotes(mockNotes);
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
    const currentRecords = notes.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(notes.length / recordsPerPage);

    const downloadCSV = () => {
        if (notes.length === 0) return;
        
        const headers = ['Supplier GSTIN', 'Supplier Name', 'Original Note Number', 'Revised Note Number', 'Note Type', 'Note Date', 'Note Value', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'Cess', 'Filing Status'];
        
        const csvRows = notes.map(n => [
            n.supplierGstin,
            n.supplierName,
            n.originalNoteNum,
            n.revisedNoteNum,
            n.noteType,
            n.noteDate,
            n.noteValue,
            n.taxableValue,
            n.igst,
            n.cgst,
            n.sgst,
            n.cess,
            n.filingStatus
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Amended_Credit_Debit_Notes.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="amcdn-container">
            {/* Breadcrumb Bar */}
            <div className="amcdn-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <Link to="/returns/gstr2a">GSTR2A</Link>
                <span>&gt;</span>
                <span>Amendments to Credit/Debit Notes</span>
            </div>

            <div className="amcdn-card">
                <div className="amcdn-header-row">
                    <h2 className="amcdn-title">Amended Credit/debit notes - Supplier wise details</h2>
                    <button className="amcdn-help-btn">HELP</button>
                </div>

                {/* Taxpayer Details Header */}
                <div className="amcdn-taxpayer-details">
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

                {!loading && notes.length === 0 ? (
                    /* Empty State Alert */
                    <div className="amcdn-alert-info">
                        <span className="info-icon">ℹ</span>
                        <span>No document found for the provided Inputs.</span>
                    </div>
                ) : (
                    /* Data Table */
                    <div className="amcdn-table-wrapper">
                        <table className="amcdn-table">
                            <thead>
                                <tr>
                                    <th>Supplier GSTIN</th>
                                    <th>Supplier Name</th>
                                    <th>Original Note Number</th>
                                    <th>Revised Note Number</th>
                                    <th>Note Type</th>
                                    <th>Note Date</th>
                                    <th>Note Value</th>
                                    <th>Taxable Value</th>
                                    <th>IGST</th>
                                    <th>CGST</th>
                                    <th>SGST</th>
                                    <th>Cess</th>
                                    <th>Filing Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((n, index) => (
                                    <tr key={index}>
                                        <td>{n.supplierGstin}</td>
                                        <td>{n.supplierName}</td>
                                        <td>{n.originalNoteNum}</td>
                                        <td>{n.revisedNoteNum}</td>
                                        <td>{n.noteType}</td>
                                        <td>{n.noteDate}</td>
                                        <td>{n.noteValue}</td>
                                        <td>{n.taxableValue}</td>
                                        <td>{n.igst}</td>
                                        <td>{n.cgst}</td>
                                        <td>{n.sgst}</td>
                                        <td>{n.cess}</td>
                                        <td>{n.filingStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="amcdn-pagination">
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
                <div className="amcdn-actions">
                    <button className="amcdn-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                    <button 
                        className={`amcdn-btn-download ${notes.length === 0 ? 'disabled' : ''}`} 
                        onClick={downloadCSV}
                        disabled={notes.length === 0}
                    >
                        DOWNLOAD DOCUMENTS (CSV)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GSTR2AAmendmentsCreditDebit;
