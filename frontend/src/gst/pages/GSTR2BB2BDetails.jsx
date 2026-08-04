import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const GSTR2BB2BDetails = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fy = searchParams.get('fy') || '2025-26';
    const month = searchParams.get('month') || 'March';

    const [profile, setProfile] = useState({
        gstin: '32AAICD8127A1Z4',
        legalName: 'D MIX MEDIA PRIVATE LIMITED',
        tradeName: '',
        arn: 'AA3203261234567',
        arnDate: '15/03/2026',
        stateName: 'Kerala'
    });

    const [loading, setLoading] = useState(true);
    const [b2bInvoices, setB2bInvoices] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});

    // Toolbar state
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                
                try {
                    const profRes = await api.get(`/forms/gstr1-profile/${trn}`);
                    if (profRes.data.success && profRes.data.data) {
                        setProfile(profRes.data.data);
                    }
                } catch (e) {
                    console.warn("Could not load registration profile.");
                }

                const gstr2bRes = await api.get(`/gstr2b/${trn}`);
                if (gstr2bRes.data.success && gstr2bRes.data.data) {
                    const rawRecords = gstr2bRes.data.data.rawRecords || [];
                    const allB2b = rawRecords.filter(r => r.source_section === 'B2B' || r.source_section === 'B2BA');
                    
                    // We combine regular and reverse charge for the B2B inward table
                    setB2bInvoices(allB2b);
                }
            } catch (err) {
                console.error("Failed to load B2B data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const formatCurr = (val) => {
        if (val === undefined || val === null || isNaN(val)) return "0.00";
        return parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const toggleRow = (index) => {
        setExpandedRows(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const getInvoiceValue = (inv) => {
        return parseFloat(inv.totalInvoiceValue || inv.taxable_value || inv.netValue || inv.value) || 0;
    };

    const todayDate = new Date().toLocaleDateString('en-GB');

    if (loading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Loading GSTR-2B B2B Details...</div>;
    }

    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            <style>{`
                .portal-wrapper {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding-top: 20px;
                    padding-bottom: 50px;
                }
                .turquoise-header {
                    background-color: #00bcd4;
                    color: white;
                    padding: 8px 15px;
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 0;
                }
                .profile-section {
                    background-color: #f9f9f9;
                    border: 1px solid #ddd;
                    padding: 15px;
                    margin-bottom: 15px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    row-gap: 10px;
                    font-size: 13px;
                }
                .profile-section strong {
                    color: #333;
                }
                .portal-card {
                    background: white;
                    border: 1px solid #ddd;
                    padding: 20px;
                }
                
                /* Top Tabs */
                .top-tabs-container {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #ddd;
                    margin-bottom: 20px;
                }
                .top-tabs {
                    display: flex;
                }
                .top-tab {
                    padding: 10px 20px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #007bff;
                    background: none;
                    border: none;
                }
                .top-tab.active {
                    color: #333;
                    border-bottom: 3px solid #007bff;
                    font-weight: bold;
                }
                
                /* Table Selector Row */
                .selector-row {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .btn-select-table {
                    background-color: #337ab7;
                    color: white;
                    border: 1px solid #2e6da4;
                    padding: 8px 15px;
                    font-size: 13px;
                    cursor: pointer;
                    border-radius: 3px 0 0 3px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .title-bar {
                    background-color: #d9edf7;
                    color: #31708f;
                    padding: 8px 15px;
                    font-size: 13px;
                    font-weight: bold;
                    flex-grow: 1;
                    border: 1px solid #bce8f1;
                    border-left: none;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .help-btn {
                    background-color: #337ab7;
                    color: white;
                    border: none;
                    padding: 3px 8px;
                    font-size: 11px;
                    border-radius: 3px;
                    cursor: pointer;
                }

                /* Detail Tabs */
                .detail-tabs {
                    display: flex;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                }
                .detail-tab {
                    padding: 8px 15px;
                    cursor: pointer;
                    font-size: 13px;
                    color: #007bff;
                    background: white;
                    border: 1px solid white;
                    border-bottom: none;
                    margin-right: 2px;
                }
                .detail-tab.active {
                    background-color: #5cb85c;
                    color: white;
                    border: 1px solid #4cae4c;
                }
                .detail-tab:not(.active):hover {
                    text-decoration: underline;
                }
                
                /* Toolbar */
                .toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 13px;
                    margin-bottom: 15px;
                }
                .toolbar-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .toolbar-select, .toolbar-input {
                    padding: 5px;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    font-size: 13px;
                }
                .btn-apply-filter {
                    background-color: white;
                    border: 1px solid #ccc;
                    padding: 5px 10px;
                    font-size: 13px;
                    cursor: pointer;
                    border-radius: 3px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .download-link {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                /* Main Table */
                .b2b-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                    margin-bottom: 15px;
                    border: 1px solid #ddd;
                }
                .b2b-table th {
                    background-color: #d9edf7;
                    color: #333;
                    border: 1px solid #ddd;
                    padding: 8px 5px;
                    text-align: center;
                    font-weight: bold;
                    vertical-align: middle;
                }
                .b2b-table td {
                    border: 1px solid #ddd;
                    padding: 8px 5px;
                    color: #333;
                    vertical-align: middle;
                }
                .b2b-table .center-align { text-align: center; }
                .b2b-table .right-align { text-align: right; }
                .sort-icon { font-size: 10px; margin-left: 3px; }
                
                .invoice-number {
                    color: #007bff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                }
                .expand-arrow {
                    font-size: 10px;
                    transition: transform 0.2s;
                }
                .expand-arrow.open {
                    transform: rotate(180deg);
                }

                /* Nested Table */
                .nested-table-container {
                    padding: 10px 15px;
                    background-color: #f9f9f9;
                }
                .nested-table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: white;
                    font-size: 12px;
                }
                .nested-table th {
                    background-color: #f5f5f5;
                    border: 1px solid #ddd;
                    padding: 6px;
                    color: #333;
                    text-align: center;
                }
                .nested-table td {
                    border: 1px solid #ddd;
                    padding: 6px;
                    text-align: right;
                }
                .nested-table td:first-child {
                    text-align: center; /* Tax Rate */
                }

                /* Pagination & Footer controls */
                .bottom-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 15px;
                }
                .pagination {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 13px;
                }
                .page-item {
                    color: #ccc;
                    cursor: not-allowed;
                }
                .page-item.active {
                    background-color: #337ab7;
                    color: white;
                    padding: 3px 8px;
                    border-radius: 3px;
                    cursor: default;
                }
                .btn-back-summary {
                    background-color: white;
                    color: #333;
                    border: 1px solid #ccc;
                    padding: 8px 15px;
                    font-size: 13px;
                    cursor: pointer;
                    border-radius: 3px;
                }
                .btn-back-summary:hover {
                    background-color: #e6e6e6;
                }

                /* GST Footer */
                .gst-footer {
                    background-color: #123456;
                    color: white;
                    padding: 30px 10%;
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    margin-top: 40px;
                }
                .gst-footer-col {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .gst-footer-title {
                    color: #00bcd4;
                    font-weight: bold;
                    margin-bottom: 10px;
                    font-size: 14px;
                }
                .gst-footer-link {
                    color: #cbd5e1;
                    text-decoration: none;
                }
                .gst-footer-link:hover {
                    text-decoration: underline;
                    color: white;
                }
            `}</style>

            <div className="portal-wrapper">
                
                <div className="turquoise-header">
                    GSTR-2B- AUTO-DRAFTED ITC STATEMENT
                </div>
                
                <div className="profile-section">
                    <div><strong>GSTIN - </strong> {profile.gstin}</div>
                    <div><strong>Financial Year - </strong> {fy}</div>
                    <div><strong>Legal Name - </strong> {profile.legalName}</div>
                    <div><strong>Return Period - </strong> {month}</div>
                    <div><strong>Trade Name - </strong> {profile.tradeName || '-'}</div>
                    <div><strong>Generation date - </strong> {todayDate}</div>
                </div>

                <div className="portal-card">
                    
                    {/* Top Tabs */}
                    <div className="top-tabs-container">
                        <div className="top-tabs">
                            <button className="top-tab" onClick={() => navigate(`/returns/gstr2b/summary?fy=${fy}&month=${month}`)}>SUMMARY</button>
                            <button className="top-tab active">ALL TABLES</button>
                        </div>
                    </div>

                    {/* Table Selector Row */}
                    <div className="selector-row">
                        <button className="btn-select-table">
                            Select table to view details ˅
                        </button>
                        <div className="title-bar">
                            Taxable inward supplies received from registered person - B2B
                            <button className="help-btn">HELP ?</button>
                        </div>
                    </div>

                    {/* Detail Tabs */}
                    <div className="detail-tabs">
                        <div className="detail-tab">Supplier wise details</div>
                        <div className="detail-tab active">Document details</div>
                    </div>

                    {/* Filter Toolbar */}
                    <div className="toolbar">
                        <div className="toolbar-group">
                            <label><strong>Display/Hide Columns:</strong></label>
                            <select className="toolbar-select" style={{ width: '80px' }}>
                                <option>+3</option>
                            </select>
                            <label style={{ marginLeft: '10px' }}><strong>Records Per Page:</strong></label>
                            <select className="toolbar-select" value={recordsPerPage} onChange={(e) => setRecordsPerPage(Number(e.target.value))}>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <button className="btn-apply-filter">
                                Apply filter <span style={{ fontSize: '10px' }}>▼</span>
                            </button>
                        </div>
                        <div className="toolbar-group">
                            <div style={{ position: 'relative' }}>
                                <input 
                                    type="text" 
                                    className="toolbar-input" 
                                    placeholder="Search..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingRight: '25px' }}
                                />
                                <span style={{ position: 'absolute', right: '8px', top: '5px', fontSize: '12px', color: '#666' }}>🔍</span>
                            </div>
                            <a href="#" className="download-link" onClick={(e) => { e.preventDefault(); /* Excel Logic */ }}>
                                Download Excel ⬇
                            </a>
                        </div>
                    </div>

                    {/* Main Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table className="b2b-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>S.NO.</th>
                                    <th>GSTIN of supplier <span className="sort-icon">▲</span></th>
                                    <th>Trade/legal name <span className="sort-icon">▲</span></th>
                                    <th>Invoice number <span className="sort-icon">▲</span></th>
                                    <th>Invoice type <span className="sort-icon">▲</span></th>
                                    <th>Invoice Date <span className="sort-icon">▲</span></th>
                                    <th>Invoice Value (₹) <span className="sort-icon">▲</span></th>
                                    <th>Place of supply <span className="sort-icon">▲</span></th>
                                    <th>Supply Reverse</th>
                                </tr>
                            </thead>
                            <tbody>
                                {b2bInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="center-align" style={{ padding: '20px' }}>No B2B Invoices Found</td>
                                    </tr>
                                ) : (
                                    b2bInvoices.slice(0, recordsPerPage).map((inv, idx) => (
                                        <React.Fragment key={idx}>
                                            <tr>
                                                <td className="center-align">{idx + 1}</td>
                                                <td className="center-align">{inv.supplier_gstin || inv.recipientGstin || inv.recipientGSTIN || '32AABCT0020H1Z5'}</td>
                                                <td className="center-align">{inv.supplier_name || inv.recipientName || 'THE FEDERAL BANK LTD'}</td>
                                                <td className="center-align">
                                                    <div className="invoice-number" onClick={() => toggleRow(idx)}>
                                                        {inv.invoice_number || inv.invoiceNo || '2603140644702113'}
                                                        <span className={`expand-arrow ${expandedRows[idx] ? 'open' : ''}`}>^</span>
                                                    </div>
                                                </td>
                                                <td className="center-align">Regular</td>
                                                <td className="center-align">{inv.invoice_date || inv.invoiceDate || '14/03/2026'}</td>
                                                <td className="right-align">{formatCurr(getInvoiceValue(inv))}</td>
                                                <td className="center-align">{inv.place_of_supply ? inv.place_of_supply.split('-')[1]?.trim() : 'Kerala'}</td>
                                                <td className="center-align">{inv.isReverseCharge || inv.reverseCharge ? 'Y' : 'N'}</td>
                                            </tr>
                                            {/* Nested Tax Details Table */}
                                            {expandedRows[idx] && (
                                                <tr>
                                                    <td colSpan="9" style={{ padding: 0 }}>
                                                        <div className="nested-table-container">
                                                            <table className="nested-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Tax Rate (%)</th>
                                                                        <th>Taxable Value (₹)</th>
                                                                        <th>Integrated Tax (₹)</th>
                                                                        <th>Central Tax (₹)</th>
                                                                        <th>State/UT Tax (₹)</th>
                                                                        <th>Cess (₹)</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(inv.itemDetails && inv.itemDetails.length > 0) ? (
                                                                        inv.itemDetails.map((item, iIdx) => (
                                                                            <tr key={iIdx}>
                                                                                <td>{item.rate ? item.rate.replace('%', '') : '18'}</td>
                                                                                <td>{formatCurr(item.taxableValue)}</td>
                                                                                <td>{formatCurr(item.integratedTax)}</td>
                                                                                <td>{formatCurr(item.centralTax)}</td>
                                                                                <td>{formatCurr(item.stateTax)}</td>
                                                                                <td>{formatCurr(item.cess)}</td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td>{inv.rate || 18}</td>
                                                                            <td>{formatCurr(inv.taxable_value || inv.taxableValue)}</td>
                                                                            <td>{formatCurr(inv.igst || inv.integratedTax)}</td>
                                                                            <td>{formatCurr(inv.cgst || inv.centralTax)}</td>
                                                                            <td>{formatCurr(inv.sgst || inv.stateTax)}</td>
                                                                            <td>{formatCurr(inv.cess)}</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Controls */}
                    <div className="bottom-controls">
                        <div className="pagination">
                            <span className="page-item">« Previous</span>
                            <span className="page-item active">1</span>
                            <span className="page-item">Next »</span>
                        </div>
                        <button className="btn-back-summary" onClick={() => navigate(`/returns/gstr2b/summary?fy=${fy}&month=${month}`)}>
                            Back to Summary
                        </button>
                    </div>

                </div>
            </div>

            {/* GST Portal Footer */}
            <div className="gst-footer">
                <div className="gst-footer-col">
                    <div className="gst-footer-title">About GST</div>
                    <a href="#" className="gst-footer-link">GST Council Structure</a>
                    <a href="#" className="gst-footer-link">GST History</a>
                </div>
                <div className="gst-footer-col">
                    <div className="gst-footer-title">Website Policies</div>
                    <a href="#" className="gst-footer-link">Website Policy</a>
                    <a href="#" className="gst-footer-link">Terms and Conditions</a>
                    <a href="#" className="gst-footer-link">Hyperlink Policy</a>
                    <a href="#" className="gst-footer-link">Disclaimer</a>
                </div>
                <div className="gst-footer-col">
                    <div className="gst-footer-title">Related Sites</div>
                    <a href="#" className="gst-footer-link">Central Board of Indirect Taxes and Customs</a>
                    <a href="#" className="gst-footer-link">State Tax Websites</a>
                    <a href="#" className="gst-footer-link">National Portal</a>
                </div>
                <div className="gst-footer-col">
                    <div className="gst-footer-title">Help</div>
                    <a href="#" className="gst-footer-link">System Requirements</a>
                    <a href="#" className="gst-footer-link">User Manuals, Videos</a>
                    <a href="#" className="gst-footer-link">CBT</a>
                    <a href="#" className="gst-footer-link">Site Map</a>
                </div>
                <div className="gst-footer-col">
                    <div className="gst-footer-title">Important Links</div>
                    <a href="#" className="gst-footer-link">Laws, Rules & Rates</a>
                </div>
                <div className="gst-footer-col">
                    <div className="gst-footer-title">Contact Us</div>
                    <a href="#" className="gst-footer-link">Help Desk Number:</a>
                    <span style={{ color: '#cbd5e1' }}>0120-1888999</span>
                </div>
            </div>
        </div>
    );
};

export default GSTR2BB2BDetails;
