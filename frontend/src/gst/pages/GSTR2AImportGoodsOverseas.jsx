import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2AImportGoodsOverseas.css';

const GSTR2AImportGoodsOverseas = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
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
                    { id: 1, boeNum: 'BOE-1001', boeDate: '15/03/2026', portCode: 'INNSA1', portName: 'Nhava Sheva', supplierName: 'Global Supplier LLC', supplierCountry: 'USA', taxableValue: '500000.00', igst: '90000.00', cess: '0.00', totalTaxCredit: '90000.00', filingPeriod: 'Mar-2026' },
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
        
        const headers = ['Bill of Entry Number', 'Bill of Entry Date', 'Port Code', 'Port Name', 'Supplier Name', 'Supplier Country', 'Taxable Value', 'IGST', 'Cess', 'Total Tax Credit', 'Filing Period'];
        
        const csvRows = filteredRecords.map(r => [
            r.boeNum,
            r.boeDate,
            r.portCode,
            r.portName,
            r.supplierName,
            r.supplierCountry,
            r.taxableValue,
            r.igst,
            r.cess,
            r.totalTaxCredit,
            r.filingPeriod
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Import_Overseas_BOE.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="igo-container">
            {/* Breadcrumb Bar */}
            <div className="igo-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <Link to="/returns/gstr2a">GSTR2A</Link>
                <span>&gt;</span>
                <span>Import of goods from overseas on bill of entry</span>
            </div>

            <div className="igo-card">
                <div className="igo-header-row">
                    <h2 className="igo-title">Import of goods from overseas on bill of entry</h2>
                    <button className="igo-help-btn">HELP</button>
                </div>

                {/* Taxpayer Details Header */}
                <div className="igo-taxpayer-details">
                    <div className="tp-row">
                        <div className="tp-item"><strong>GSTIN:</strong> {taxpayerInfo.gstin}</div>
                        <div className="tp-item"><strong>Trade/Legal Name:</strong> {taxpayerInfo.tradeName} / {taxpayerInfo.legalName}</div>
                    </div>
                    <div className="tp-row">
                        <div className="tp-item"><strong>Financial Year:</strong> {taxpayerInfo.financialYear}</div>
                        <div className="tp-item"><strong>Return Period:</strong> {taxpayerInfo.returnPeriod}</div>
                    </div>
                </div>

                {!loading && records.length === 0 ? (
                    /* Empty State Alert */
                    <div className="igo-alert-info">
                        <span className="info-icon">ℹ</span>
                        <span>No Record found for the provided Inputs.</span>
                    </div>
                ) : (
                    /* Data Table Section */
                    <div className="igo-table-wrapper">
                        
                        {/* Search Bar */}
                        <div className="igo-search-bar">
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

                        <table className="igo-table">
                            <thead>
                                <tr>
                                    <th>Bill of Entry Number</th>
                                    <th>Bill of Entry Date</th>
                                    <th>Port Code</th>
                                    <th>Port Name</th>
                                    <th>Supplier Name</th>
                                    <th>Supplier Country</th>
                                    <th>Taxable Value</th>
                                    <th>IGST</th>
                                    <th>Cess</th>
                                    <th>Total Tax Credit</th>
                                    <th>Filing Period</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.length > 0 ? currentRecords.map((r, index) => (
                                    <tr key={index}>
                                        <td>{r.boeNum}</td>
                                        <td>{r.boeDate}</td>
                                        <td>{r.portCode}</td>
                                        <td>{r.portName}</td>
                                        <td>{r.supplierName}</td>
                                        <td>{r.supplierCountry}</td>
                                        <td>{r.taxableValue}</td>
                                        <td>{r.igst}</td>
                                        <td>{r.cess}</td>
                                        <td>{r.totalTaxCredit}</td>
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
                            <div className="igo-pagination">
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
                <div className="igo-actions">
                    <button className="igo-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                    <button 
                        className={`igo-btn-download ${records.length === 0 ? 'disabled' : ''}`} 
                        onClick={downloadCSV}
                        disabled={records.length === 0}
                    >
                        DOWNLOAD DOCUMENTS (CSV)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GSTR2AImportGoodsOverseas;
