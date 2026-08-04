import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1DocumentsIssued.css';
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import toast, { Toaster } from 'react-hot-toast';

const GSTR1DocumentsIssued = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // State to hold documents for each category
    const [docRecords, setDocRecords] = useState({});

    // Define the 12 categories from the GST portal
    const categories = [
        "1. Invoices for outward supply",
        "2. Invoices for inward supply from unregistered person",
        "3. Revised Invoice",
        "4. Debit Note",
        "5. Credit Note",
        "6. Receipt voucher",
        "7. Payment Voucher",
        "8. Refund voucher",
        "9. Delivery Challan for job work",
        "10. Delivery Challan for supply on approval",
        "11. Delivery Challan in case of liquid gas",
        "12. Delivery Challan in cases other than by way of supply (excluding at S no. 9 to 11)"
    ];

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const res = await gstr1Service.getGstr1Records('gstr1_docs_issued', trn);

                if (res.success && res.data) {
                    const docs = res.data || [];
                    const grouped = {};
                    docs.forEach(doc => {
                        if (!grouped[doc.category]) grouped[doc.category] = [];
                        grouped[doc.category].push(doc);
                    });
                    setDocRecords(grouped);
                } else {
                    setDocRecords({});
                }
            } catch (error) {
            console.error("Failed to fetch documents issued records");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddRecord = (cat) => {
        setDocRecords(prev => ({
            ...prev,
            [cat]: [
                ...(prev[cat] || []),
                { fromSerial: '', toSerial: '', total: 0, cancelled: 0, net: 0, id: Date.now() }
            ]
        }));
    };

    const handleRecordChange = (cat, index, field, value) => {
        const updated = [...(docRecords[cat] || [])];
        updated[index] = { ...updated[index], [field]: value };

        // Calculate net issued if total or cancelled changes
        if (field === 'total' || field === 'cancelled') {
            const t = parseInt(updated[index].total) || 0;
            const c = parseInt(updated[index].cancelled) || 0;
            updated[index].net = Math.max(0, t - c);
        }

        setDocRecords(prev => ({ ...prev, [cat]: updated }));
    };

    const handleDeleteRecord = (cat, index) => {
        const updated = [...(docRecords[cat] || [])];
        updated.splice(index, 1);
        setDocRecords(prev => ({ ...prev, [cat]: updated }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            // Flatten records for saving
            const allDocs = [];
            Object.keys(docRecords).forEach(cat => {
                docRecords[cat].forEach(rec => {
                    allDocs.push({ ...rec, category: cat });
                });
            });

            await Promise.all(
                allDocs.map(async (doc) => {
                    const payload = {
                        trn,
                        category: doc.category,
                        from_serial_no: doc.fromSerial,
                        to_serial_no: doc.toSerial,
                        total_number: parseInt(doc.total) || 0,
                        cancelled_number: parseInt(doc.cancelled) || 0,
                        net_issued: parseInt(doc.net) || 0
                    };
                    return gstr1Service.saveGstr1Record('gstr1_docs_issued', payload);
                })
            );

            toast.success('Documents Issued saved successfully!');
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
                    <span style={{ color: '#4b5563' }}>Documents Issued</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="docs-main-content">
                {/* Cyan Header Banner */}
                <div className="docs-header-banner">
                    <div className="docs-header-flex">
                        <h2 className="docs-title">13 - Documents issued during the tax period</h2>
                        <button className="docs-refresh-icon" onClick={fetchRecords}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="docs-body">
                    {/* Note Box */}
                    <div className="docs-instructions">
                        <p>Note: Kindly click on save button after any modification( add, edit, delete) to save the changes</p>
                    </div>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
                    ) : (
                        categories.map((cat, catIdx) => (
                            <div key={catIdx} className="doc-category-section">
                                <h3 className="category-title">{cat}</h3>
                                <div className="doc-table-wrapper">
                                    <table className="doc-portal-table">
                                        <thead>
                                            <tr>
                                                <th rowSpan="2" style={{ width: '60px' }}>No.</th>
                                                <th colSpan="2">Sr. No. <span className="red-dot">*</span></th>
                                                <th rowSpan="2">Total number <span className="red-dot">*</span></th>
                                                <th rowSpan="2">Cancelled <span className="red-dot">*</span></th>
                                                <th rowSpan="2">Net issued <span className="red-dot">*</span></th>
                                                <th rowSpan="2" style={{ width: '100px' }}>Action</th>
                                            </tr>
                                            <tr>
                                                <th>From</th>
                                                <th>To</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(!docRecords[cat] || docRecords[cat].length === 0) ? (
                                                <tr>
                                                    <td colSpan="7" className="doc-empty-row">
                                                        <div className="doc-empty-alert">
                                                            There are no documents to be displayed.
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                docRecords[cat].map((rec, recIdx) => (
                                                    <tr key={rec.id || recIdx}>
                                                        <td>{recIdx + 1}</td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="doc-table-input"
                                                                value={rec.fromSerial || ''}
                                                                onChange={(e) => handleRecordChange(cat, recIdx, 'fromSerial', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="doc-table-input"
                                                                value={rec.toSerial || ''}
                                                                onChange={(e) => handleRecordChange(cat, recIdx, 'toSerial', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="doc-table-input"
                                                                value={rec.total || 0}
                                                                onChange={(e) => handleRecordChange(cat, recIdx, 'total', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="doc-table-input"
                                                                value={rec.cancelled || 0}
                                                                onChange={(e) => handleRecordChange(cat, recIdx, 'cancelled', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="doc-table-input disabled-input"
                                                                value={rec.net || 0}
                                                                readOnly
                                                            />
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <button
                                                                className="doc-btn-delete-icon"
                                                                onClick={() => handleDeleteRecord(cat, recIdx)}
                                                                title="Delete Record"
                                                            >
                                                                <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                                                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="category-actions">
                                    <button className="docs-btn-add" onClick={() => handleAddRecord(cat)}>ADD DOCUMENT</button>
                                </div>
                            </div>
                        ))
                    )}

                    <div className="docs-footer-actions">
                        <button className="docs-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                        <button className="docs-btn-primary" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'SAVING...' : 'SAVE'}
                        </button>
                    </div>
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
    );
};

export default GSTR1DocumentsIssued;
