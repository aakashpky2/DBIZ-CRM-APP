import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2AImportSEZGoods.css';

const GSTR2AImportSEZGoods = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showHelp, setShowHelp] = useState(false);
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

                // Mock Fetch Records
                const mockRecords = [];
                /*
                const mockRecords = [
                    { id: 1, boeNum: 'BOE-SEZ-101', boeDate: '15/03/2026', sezGstin: '07AAACA1234A1Z5', sezName: 'SEZ DEVELOPER LTD', portCode: 'INNSA1', portName: 'Nhava Sheva', taxableValue: '100000.00', igstAmt: '18000.00', cess: '0.00', totalItc: '18000.00', filingPeriod: 'Mar-2026' },
                ];
                */
                
                setRecords(mockRecords);
            } catch (err) {
                console.warn('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter Records for Search
    const filteredRecords = records.filter(record => 
        Object.values(record).some(val => 
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Pagination Logic
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

    const downloadCSV = () => {
        if (filteredRecords.length === 0) return;
        
        const headers = ['Bill of Entry Number', 'Bill of Entry Date', 'SEZ Unit / Developer GSTIN', 'SEZ Unit / Developer Name', 'Port Code', 'Port Name', 'Taxable Value', 'IGST Amount', 'Compensation Cess', 'Total ITC Available', 'Filing Period'];
        
        const csvRows = filteredRecords.map(r => [
            r.boeNum,
            r.boeDate,
            r.sezGstin,
            r.sezName,
            r.portCode,
            r.portName,
            r.taxableValue,
            r.igstAmt,
            r.cess,
            r.totalItc,
            r.filingPeriod
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Import_SEZ_BOE.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="isez-container">
            {/* Breadcrumb Bar */}
            <div className="isez-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <Link to="/returns/gstr2a">GSTR2A</Link>
                <span>&gt;</span>
                <span>Import of goods from SEZ units / developers on bill of entry</span>
            </div>

            <div className="isez-card">
                <div className="isez-header-row">
                    <h2 className="isez-title">Import of goods from SEZ units / developers on bill of entry</h2>
                    <button className="isez-help-btn" onClick={() => setShowHelp(true)}>
                        <span className="help-icon">?</span> HELP
                    </button>
                </div>

                {/* Taxpayer Details Header */}
                <div className="isez-taxpayer-details">
                    <div className="tp-row">
                        <div className="tp-item"><strong>GSTIN:</strong> {taxpayerInfo.gstin}</div>
                        <div className="tp-item"><strong>Trade / Legal Name:</strong> {taxpayerInfo.tradeName} / {taxpayerInfo.legalName}</div>
                    </div>
                    <div className="tp-row">
                        <div className="tp-item"><strong>Financial Year:</strong> {taxpayerInfo.financialYear}</div>
                        <div className="tp-item"><strong>Return Period:</strong> {taxpayerInfo.returnPeriod}</div>
                    </div>
                </div>

                {!loading && records.length === 0 ? (
                    /* Empty State Alert */
                    <div className="isez-alert-info">
                        <span className="info-icon">ℹ</span>
                        <span>No Record found for the provided Inputs.</span>
                    </div>
                ) : (
                    /* Data Table Section */
                    <div className="isez-table-wrapper">
                        
                        {/* Search Bar */}
                        <div className="isez-search-bar">
                            <label>Search:</label>
                            <input 
                                type="text" 
                                value={searchTerm} 
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }} 
                                placeholder="Search any column..."
                            />
                        </div>

                        <table className="isez-table">
                            <thead>
                                <tr>
                                    <th>Bill of Entry Number</th>
                                    <th>Bill of Entry Date</th>
                                    <th>SEZ Unit / Developer GSTIN</th>
                                    <th>SEZ Unit / Developer Name</th>
                                    <th>Port Code</th>
                                    <th>Port Name</th>
                                    <th>Taxable Value</th>
                                    <th>IGST Amount</th>
                                    <th>Compensation Cess</th>
                                    <th>Total ITC Available</th>
                                    <th>Filing Period</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.length > 0 ? currentRecords.map((r, index) => (
                                    <tr key={index}>
                                        <td>{r.boeNum}</td>
                                        <td>{r.boeDate}</td>
                                        <td>{r.sezGstin}</td>
                                        <td>{r.sezName}</td>
                                        <td>{r.portCode}</td>
                                        <td>{r.portName}</td>
                                        <td>{r.taxableValue}</td>
                                        <td>{r.igstAmt}</td>
                                        <td>{r.cess}</td>
                                        <td>{r.totalItc}</td>
                                        <td>{r.filingPeriod}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="11" style={{ textAlign: 'center' }}>No matching records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="isez-pagination">
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
                <div className="isez-actions">
                    <button className="isez-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                    <button 
                        className={`isez-btn-download ${records.length === 0 ? 'disabled' : ''}`} 
                        onClick={downloadCSV}
                        disabled={records.length === 0}
                    >
                        DOWNLOAD DOCUMENTS (CSV)
                    </button>
                </div>
            </div>

            {/* Help Modal */}
            {showHelp && (
                <div className="isez-modal-overlay">
                    <div className="isez-modal">
                        <div className="isez-modal-header">
                            <h3>Help - Import from SEZ Units</h3>
                            <button className="isez-modal-close" onClick={() => setShowHelp(false)}>×</button>
                        </div>
                        <div className="isez-modal-body">
                            <h4>Import from SEZ Unit Guidelines</h4>
                            <p>This section auto-drafts the details of imports made from SEZ units or developers based on the bill of entry filed at the ICEGATE portal.</p>
                            
                            <h4>Bill of Entry Validation Rules</h4>
                            <p>The details must include a valid Port Code and Bill of Entry (BOE) Number. These records are updated upon integration from Customs (ICEGATE) to the GST System.</p>
                            
                            <h4>ITC Eligibility Conditions</h4>
                            <p>You can claim Input Tax Credit (ITC) for the IGST and Cess paid on these imports, subject to the conditions of section 16 of the CGST Act.</p>
                            
                            <h4>Download Instructions</h4>
                            <p>You may click on "DOWNLOAD DOCUMENTS (CSV)" to export the entire list of BOEs for your offline matching or reconciliation purposes.</p>
                        </div>
                        <div className="isez-modal-footer">
                            <button onClick={() => setShowHelp(false)}>CLOSE</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GSTR2AImportSEZGoods;
