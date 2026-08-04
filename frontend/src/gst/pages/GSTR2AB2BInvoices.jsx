import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2AB2BInvoices.css';

const GSTR2AB2BInvoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const [taxpayerInfo, setTaxpayerInfo] = useState({ gstin: '', legalName: '', tradeName: '', financialYear: '2025-26', returnPeriod: 'March' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                try {
                    const userRes = await api.get('/auth/me');
                    if (userRes.data?.success && userRes.data?.data) {
                        const u = userRes.data.data;
                        setTaxpayerInfo(prev => ({ ...prev, gstin: u.gstin || u.pan || trn, legalName: u.legal_name || 'GST USER', tradeName: u.trade_name || '' }));
                    }
                } catch (_) {}

                const res = await api.get(`/gstr2a/b2b/${trn}`);
                if (res.data?.success) {
                    setInvoices(res.data.data || []);
                }
            } catch (err) {
                console.warn('Failed to fetch GSTR-2A B2B data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRecords = invoices.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(invoices.length / recordsPerPage);
    const fmt = v => parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    const downloadCSV = () => {
        if (!invoices.length) return;
        const headers = ['Supplier GSTIN', 'Supplier Name', 'Invoice No', 'Invoice Date', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'CESS', 'Total Tax', 'Status'];
        const rows = invoices.map(r => [r.supplier_gstin, r.supplier_name, r.invoice_number, r.invoice_date, r.taxable_value, r.igst, r.cgst, r.sgst, r.cess, r.total_tax, r.status].join(','));
        const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'GSTR2A_B2B.csv'; a.click();
    };

    return (
        <div className="b2b-container">
            <div className="b2b-breadcrumb">
                <Link to="/dashboard">Dashboard</Link><span>›</span>
                <Link to="/returns-dashboard">Returns</Link><span>›</span>
                <Link to="/returns/gstr2a">GSTR-2A</Link><span>›</span>
                <span>B2B Invoices</span>
            </div>

            <div className="b2b-card">
                <div style={{ background: '#009688', color: 'white', padding: '10px 15px', fontSize: '15px', fontWeight: 'bold', marginBottom: '15px' }}>
                    B2B Invoices — Auto Drafted (Read Only)
                </div>

                <div className="b2b-taxpayer-details">
                    <div className="tp-row">
                        <div className="tp-item"><strong>GSTIN:</strong> {taxpayerInfo.gstin}</div>
                        <div className="tp-item"><strong>Legal Name:</strong> {taxpayerInfo.legalName}</div>
                        <div className="tp-item"><strong>Financial Year:</strong> {taxpayerInfo.financialYear}</div>
                    </div>
                </div>

                <div style={{ background: '#e3f2fd', border: '1px solid #90caf9', padding: '8px 12px', fontSize: '13px', marginBottom: '10px', color: '#1565c0' }}>
                    ℹ Records shown below are auto-generated from your suppliers' GSTR-1 filings. This section is <strong>read-only</strong>.
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Loading GSTR-2A B2B data...</div>
                ) : invoices.length === 0 ? (
                    <div className="b2b-alert-info"><span className="info-icon">ℹ</span><span>No B2B Invoices found. Records will appear here once your suppliers file GSTR-1 with your GSTIN as receiver.</span></div>
                ) : (
                    <div className="b2b-table-wrapper">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#555' }}>Total Records: <strong>{invoices.length}</strong></span>
                            <button onClick={downloadCSV} style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '6px 14px', fontSize: '12px', cursor: 'pointer' }}>⬇ Download CSV</button>
                        </div>
                        <table className="b2b-table">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Supplier GSTIN</th>
                                    <th>Supplier Name</th>
                                    <th>Invoice No</th>
                                    <th>Invoice Date</th>
                                    <th>Taxable Value (₹)</th>
                                    <th>IGST (₹)</th>
                                    <th>CGST (₹)</th>
                                    <th>SGST (₹)</th>
                                    <th>Total Tax (₹)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((inv, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                        <td style={{ textAlign: 'center' }}>{indexOfFirst + i + 1}</td>
                                        <td>{inv.supplier_gstin}</td>
                                        <td>{inv.supplier_name}</td>
                                        <td style={{ color: '#1a73e8', fontWeight: '500' }}>{inv.invoice_number}</td>
                                        <td>{inv.invoice_date}</td>
                                        <td style={{ textAlign: 'right' }}>{fmt(inv.taxable_value)}</td>
                                        <td style={{ textAlign: 'right' }}>{fmt(inv.igst)}</td>
                                        <td style={{ textAlign: 'right' }}>{fmt(inv.cgst)}</td>
                                        <td style={{ textAlign: 'right' }}>{fmt(inv.sgst)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{fmt(inv.total_tax)}</td>
                                        <td><span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', fontSize: '11px', borderRadius: '2px', border: '1px solid #c8e6c9' }}>{inv.status || 'ACTIVE'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div className="b2b-pagination">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>« Previous</button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next »</button>
                            </div>
                        )}
                    </div>
                )}

                <div className="b2b-actions">
                    <button className="b2b-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                </div>
            </div>
        </div>
    );
};

export default GSTR2AB2BInvoices;
