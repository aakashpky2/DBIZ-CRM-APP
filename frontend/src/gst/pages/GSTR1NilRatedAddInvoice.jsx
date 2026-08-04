import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1NilRatedAddInvoice.css'; // Specific styles for this page
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import toast, { Toaster } from 'react-hot-toast';

const GSTR1NilRatedAddInvoice = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    // Initial state matching GST portal's 4 rows x 3 columns matrix
    const [rows, setRows] = useState([
        { description: 'Intra-state supplies to registered person', nilRated: '0.00', exempted: '0.00', nonGst: '0.00' },
        { description: 'Intra-state supplies to unregistered person', nilRated: '0.00', exempted: '0.00', nonGst: '0.00' },
        { description: 'Inter-state supplies to registered person', nilRated: '0.00', exempted: '0.00', nonGst: '0.00' },
        { description: 'Inter-state supplies to unregistered person', nilRated: '0.00', exempted: '0.00', nonGst: '0.00' }
    ]);

    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await api.get(`/forms/tab/${trn}/GSTR1_NilRated_Supplies`);
                if (res.data.success && res.data.data && Array.isArray(res.data.data.invoices)) {
                    if (res.data.data.invoices.length === 4) {
                        setRows(res.data.data.invoices);
                    }
                }
            } catch (err) {
                console.error("Failed to load existing Nil Rated data");
            }
        };
        fetchExisting();
    }, []);

    const handleInputChange = (rowIndex, field, value) => {
        const updatedRows = [...rows];
        updatedRows[rowIndex][field] = value;
        setRows(updatedRows);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            await Promise.all(rows.map(async (row) => {
                const payload = {
                    trn,
                    description: row.description,
                    nil_rated_value: parseFloat(row.nilRated) || 0,
                    exempted_value: parseFloat(row.exempted) || 0,
                    non_gst_value: parseFloat(row.nonGst) || 0
                };
                return gstr1Service.saveGstr1Record('gstr1_nil_rated_supplies', payload);
            }));

            toast.success('Nil Rated Supplies saved successfully!');
            navigate('/returns/gstr1');
        } catch (err) {
            toast.error('Error saving: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6' }}>
            <Toaster position="top-right" />
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#167dc2' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>NIL-RATED</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="nilrated-recreate-container">

                {/* Cyan Header Banner */}
                <div className="nilrated-recreate-header">
                    <h2 className="nilrated-recreate-title">8A, 8B, 8C, 8D - Nil Rated, Exempted and Non-GST Supplies</h2>
                    <div className="nilrated-recreate-header-actions">
                        <button className="refresh-btn">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="nilrated-recreate-body">
                    <h3 className="section-subtitle">Item details</h3>

                    <div className="nilrated-table-wrapper">
                        <table className="nilrated-recreate-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '35%' }}>Description</th>
                                    <th>Nil Rated Supplies (₹)</th>
                                    <th>Exempted(Other than Nil rated/non-GST supply) (₹)</th>
                                    <th>Non-GST Supplies (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="desc-cell">{row.description}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="portal-input"
                                                value={row.nilRated}
                                                onChange={(e) => handleInputChange(idx, 'nilRated', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="portal-input"
                                                value={row.exempted}
                                                onChange={(e) => handleInputChange(idx, 'exempted', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="portal-input"
                                                value={row.nonGst}
                                                onChange={(e) => handleInputChange(idx, 'nonGst', e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="nilrated-recreate-actions">
                        <button className="portal-btn-back" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                        <button className="portal-btn-save" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'SAVING...' : 'SAVE'}
                        </button>
                    </div>
                </div>

                <div style={{ flexGrow: 1 }}></div>

                {/* Footer Bar */}
                <footer className="dashboard-footer-bar">
                    <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                    <div className="footer-center">Site Last Updated on 24-01-2026</div>
                    <div className="footer-right">Designed &amp; Developed by GSTN</div>
                </footer>
            </div>
        </div>
    );
};

export default GSTR1NilRatedAddInvoice;
