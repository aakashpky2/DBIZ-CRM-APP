import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2ACreditDebitNotes.css';

const GSTR2ACreditDebitNotes = () => {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const [taxpayerInfo, setTaxpayerInfo] = useState({ gstin: '', legalName: '', financialYear: '2025-26' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                try {
                    const userRes = await api.get('/auth/me');
                    if (userRes.data?.success && userRes.data?.data) {
                        const u = userRes.data.data;
                        setTaxpayerInfo(prev => ({ ...prev, gstin: u.gstin || u.pan || trn, legalName: u.legal_name || 'GST USER' }));
                    }
                } catch (_) {}

                const res = await api.get(`/gstr2a/cdnr/${trn}`);
                if (res.data?.success) setNotes(res.data.data || []);
            } catch (err) {
                console.warn('Failed to fetch GSTR-2A CDNR data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentRecords = notes.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(notes.length / recordsPerPage);
    const fmt = v => parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    return (
        <div className="cdn-container">
            <div className="cdn-breadcrumb">
                <Link to="/dashboard">Dashboard</Link><span>›</span>
                <Link to="/returns-dashboard">Returns</Link><span>›</span>
                <Link to="/returns/gstr2a">GSTR-2A</Link><span>›</span>
                <span>Credit/Debit Notes</span>
            </div>

            <div className="cdn-card">
                <div style={{ background: '#009688', color: 'white', padding: '10px 15px', fontSize: '15px', fontWeight: 'bold', marginBottom: '15px' }}>
                    Credit / Debit Notes — Auto Drafted (Read Only)
                </div>

                <div className="cdn-taxpayer-details">
                    <div className="tp-row">
                        <div className="tp-item"><strong>GSTIN:</strong> {taxpayerInfo.gstin}</div>
                        <div className="tp-item"><strong>Legal Name:</strong> {taxpayerInfo.legalName}</div>
                        <div className="tp-item"><strong>Financial Year:</strong> {taxpayerInfo.financialYear}</div>
                    </div>
                </div>

                <div style={{ background: '#e3f2fd', border: '1px solid #90caf9', padding: '8px 12px', fontSize: '13px', marginBottom: '10px', color: '#1565c0' }}>
                    ℹ Records shown below are auto-generated from your suppliers' GSTR-1 CDNR filings. This section is <strong>read-only</strong>.
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Loading...</div>
                ) : notes.length === 0 ? (
                    <div className="cdn-alert-info"><span className="info-icon">ℹ</span><span>No Credit/Debit Notes found. Records appear when suppliers file CDNR with your GSTIN.</span></div>
                ) : (
                    <div className="cdn-table-wrapper">
                        <span style={{ fontSize: '13px', color: '#555', display: 'block', marginBottom: '8px' }}>Total Records: <strong>{notes.length}</strong></span>
                        <table className="cdn-table">
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Supplier GSTIN</th>
                                    <th>Supplier Name</th>
                                    <th>Note Number</th>
                                    <th>Note Type</th>
                                    <th>Note Date</th>
                                    <th>Taxable Value (₹)</th>
                                    <th>IGST (₹)</th>
                                    <th>CGST (₹)</th>
                                    <th>SGST (₹)</th>
                                    <th>Total Tax (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((n, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                        <td style={{ textAlign: 'center' }}>{indexOfFirst + i + 1}</td>
                                        <td>{n.supplier_gstin}</td>
                                        <td>{n.supplier_name}</td>
                                        <td style={{ color: '#1a73e8' }}>{n.note_number}</td>
                                        <td><span style={{ background: n.note_type === 'Credit' ? '#e8f5e9' : '#fff3e0', color: n.note_type === 'Credit' ? '#2e7d32' : '#e65100', padding: '2px 8px', fontSize: '11px' }}>{n.note_type}</span></td>
                                        <td>{n.note_date}</td>
                                        <td style={{ textAlign: 'right' }}>{fmt(n.taxable_value)}</td>
                                        <td style={{ textAlign: 'right' }}>{fmt(n.igst)}</td>
                                        <td style={{ textAlign: 'right' }}>{fmt(n.cgst)}</td>
                                        <td style={{ textAlign: 'right' }}>{fmt(n.sgst)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{fmt(n.total_tax)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {totalPages > 1 && (
                            <div className="cdn-pagination">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>« Previous</button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next »</button>
                            </div>
                        )}
                    </div>
                )}

                <div className="cdn-actions">
                    <button className="cdn-btn-back" onClick={() => navigate('/returns/gstr2a')}>BACK</button>
                </div>
            </div>
        </div>
    );
};

export default GSTR2ACreditDebitNotes;
