import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2AAmendmentsB2B.css';

const GSTR2AAmendmentsB2B = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
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

                // Fetch real GSTR-2A Amended Invoices
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await api.get(`/gstr2a/amended/${trn}`);
                if (res.data?.success) {
                    const mapped = (res.data.data || []).map(r => ({
                        supplierGstin: r.supplier_gstin,
                        supplierName: r.supplier_name,
                        originalInvoiceNum: r.source_gstr1_id?.split('_').pop() || '-',
                        revisedInvoiceNum: r.invoice_number,
                        invoiceDate: r.invoice_date,
                        invoiceValue: (parseFloat(r.taxable_value) + parseFloat(r.total_tax)).toFixed(2),
                        taxableValue: parseFloat(r.taxable_value).toFixed(2),
                        igst: parseFloat(r.igst).toFixed(2),
                        cgst: parseFloat(r.cgst).toFixed(2),
                        sgst: parseFloat(r.sgst).toFixed(2),
                        cess: parseFloat(r.cess).toFixed(2),
                        filingStatus: 'Filed'
                    }));
                    setInvoices(mapped);
                }
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
    const currentRecords = invoices.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(invoices.length / recordsPerPage);

    const downloadCSV = () => {
        if (invoices.length === 0) return;
        
        const headers = ['Supplier GSTIN', 'Supplier Name', 'Original Invoice Number', 'Revised Invoice Number', 'Invoice Date', 'Invoice Value', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'Cess', 'Filing Status'];
        
        const csvRows = invoices.map(inv => [
            inv.supplierGstin,
            inv.supplierName,
            inv.originalInvoiceNum,
            inv.revisedInvoiceNum,
            inv.invoiceDate,
            inv.invoiceValue,
            inv.taxableValue,
            inv.igst,
            inv.cgst,
            inv.sgst,
            inv.cess,
            inv.filingStatus
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Amendments_B2B_Invoices.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="amb2b-container">
            {/* Breadcrumb Bar */}
            <div className="amb2b-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>&gt;</span>
                <Link to="/returns/gstr2a">GSTR2A</Link>
                <span>&gt;</span>
                <span>Amendments to B2B Invoices</span>
            </div>

            <div className="amb2b-card">
                <h2 className="amb2b-title">Amended B2B Invoices - Supplier Details</h2>

                {/* Taxpayer Details Header */}
                <div className="amb2b-taxpayer-details">
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

                {!loading && invoices.length === 0 ? (
                    /* Empty State Alert */
                    <div className="amb2b-alert-info">
                        <span className="info-icon">ℹ</span>
                        <span>No document found for the provided Inputs.</span>
                    </div>
                ) : (
                    /* Data Table */
                    <div className="amb2b-table-wrapper">
                        <table className="amb2b-table">
                            <thead>
                                <tr>
                                    <th>Supplier GSTIN</th>
                                    <th>Supplier Name</th>
                                    <th>Original Invoice Number</th>
                                    <th>Revised Invoice Number</th>
                                    <th>Invoice Date</th>
                                    <th>Invoice Value</th>
                                    <th>Taxable Value</th>
                                    <th>IGST</th>
                                    <th>CGST</th>
                                    <th>SGST</th>
                                    <th>Cess</th>
                                    <th>Filing Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((inv, index) => (
                                    <tr key={index}>
                                        <td>{inv.supplierGstin}</td>
                                        <td>{inv.supplierName}</td>
                                        <td>{inv.originalInvoiceNum}</td>
                                        <td>{inv.revisedInvoiceNum}</td>
                                        <td>{inv.invoiceDate}</td>
                                        <td>{inv.invoiceValue}</td>
                                        <td>{inv.taxableValue}</td>
                                        <td>{inv.igst}</td>
                                        <td>{inv.cgst}</td>
                                        <td>{inv.sgst}</td>
                                        <td>{inv.cess}</td>
                                        <td>{inv.filingStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="amb2b-pagination">
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
                <div className="amb2b-actions">
                    <button className="amb2b-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                    <button 
                        className={`amb2b-btn-download ${invoices.length === 0 ? 'disabled' : ''}`} 
                        onClick={downloadCSV}
                        disabled={invoices.length === 0}
                    >
                        DOWNLOAD DOCUMENTS (CSV)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GSTR2AAmendmentsB2B;
