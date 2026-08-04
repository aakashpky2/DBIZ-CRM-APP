import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1Dashboard.css'; // Reusing info block and basic styles
import './GSTR1B2CLDashboard.css'; // B2CL specific styles
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import PageLoader from '../components/PageLoader';

const GSTR1B2CLDashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
            const res = await gstr1Service.getGstr1Records('gstr1_b2cl_invoices', trn);

            if (res.success && res.data) {
                const active = res.data.filter(inv => inv.status !== 'deleted' && inv.is_deleted !== true && inv.isDeleted !== true);
                setInvoices(active);
            } else {
                setInvoices([]);
            }
        } catch (error) {
            console.error('Failed to fetch B2CL invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleRefresh = () => {
        fetchInvoices();
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    const formatCurrency = (val) => parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-GB');
    };

    const sortedInvoices = [...invoices].sort((a, b) => {
        const dateA = new Date(a.invoiceDate || a.invoice_date || a.created_at || 0);
        const dateB = new Date(b.invoiceDate || b.invoice_date || b.created_at || 0);
        if (dateB.getTime() !== dateA.getTime()) {
            return dateB - dateA;
        }
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    const totalRecords = sortedInvoices.length;
    const totalInvoiceValue = sortedInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalInvoiceValue || inv.total_invoice_value || 0), 0);
    const totalTaxableValue = sortedInvoices.reduce((sum, inv) => {
        const items = inv.itemDetails || inv.items || [];
        return sum + items.reduce((itemSum, item) => itemSum + parseFloat(item.taxableValue || item.taxable_value || 0), 0);
    }, 0);

    return (
        <>
        <PageLoader loading={loading} />
        <div className="dashboard-container" onClick={handleBackdropClick} style={{ backgroundColor: '#f5f5f5' }}>
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#3b82f6' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>B2CL</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="gstr1-main-content b2cl-main-content" style={{ width: '90%', margin: '15px auto 0 auto', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Cyan Header Banner */}
                    <div className="b2cl-header-banner" style={{ marginTop: 0 }}>
                        <div className="b2cl-header-top">
                            <h2 className="b2cl-title">5 - B2C (Large) Invoices</h2>
                            <div className="gstr1-header-actions">
                                <button className="gstr1-btn-secondary">HELP <span style={{ fontSize: '12px', border: '1px solid #fff', borderRadius: '50%', padding: '0 4px', marginLeft: '4px' }}>?</span></button>
                                <button className="gstr1-btn-icon" onClick={handleRefresh}>↻</button>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        {/* Dynamic Records Box */}
                        {loading ? (
                            <div className="b2cl-empty-records" style={{ textAlign: 'center' }}>Loading...</div>
                        ) : sortedInvoices.length === 0 ? (
                            <div className="b2cl-empty-records">
                                No B2C (Large) invoices found for the selected return period.
                            </div>
                        ) : (
                            <div className="b2cl-records-container">
                                <div style={{ background: '#f5f5f5', border: '1px solid #ccc', padding: '15px', marginBottom: '15px', display: 'flex', gap: '30px', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                                    <div>Total Records : {totalRecords}</div>
                                    <div>Total Invoice Value : ₹{formatCurrency(totalInvoiceValue)}</div>
                                    <div>Total Taxable Value : ₹{formatCurrency(totalTaxableValue)}</div>
                                </div>
                                <div className="b2cl-records-table-container">
                                    <table className="b2cl-records-table">
                                        <thead>
                                            <tr>
                                                <th>POS</th>
                                                <th>Invoice No.</th>
                                                <th>Invoice Date</th>
                                                <th>Total Invoice Value (₹)</th>
                                                <th>Taxable Value (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedInvoices.map((inv, idx) => {
                                                const items = inv.itemDetails || inv.items || [];
                                                const totalTaxable = items.reduce((sum, item) => sum + parseFloat(item.taxableValue || item.taxable_value || 0), 0);
                                                
                                                let posDisplay = inv.pos || '';
                                                if (posDisplay && !posDisplay.includes('-')) {
                                                    const codes = { '07': 'Delhi', '32': 'Kerala', '27': 'Maharashtra' };
                                                    if (codes[posDisplay]) posDisplay = `${posDisplay}-${codes[posDisplay]}`;
                                                }

                                                return (
                                                    <tr key={inv.id || idx} onClick={() => navigate(`/returns/auth/gstr1/b2cl/edit/${inv.id}`)} style={{ cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor='#f0f8ff'} onMouseOut={e => e.currentTarget.style.backgroundColor=''}>
                                                        <td>{posDisplay}</td>
                                                        <td style={{ color: '#1a73e8' }}>{inv.invoiceNo || inv.invoice_number || inv.invoice_no}</td>
                                                        <td>{formatDate(inv.invoiceDate || inv.invoice_date)}</td>
                                                        <td style={{ textAlign: 'right' }}>{formatCurrency(inv.totalInvoiceValue || inv.total_invoice_value)}</td>
                                                        <td style={{ textAlign: 'right' }}>{formatCurrency(totalTaxable)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Bottom Actions */}
                        <div className="b2cl-actions-row">
                            <button className="b2cl-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                            <button className="b2cl-btn-primary" onClick={() => navigate('/returns/auth/gstr1/b2cl/add')}>ADD RECORD</button>
                            <button className="b2cl-btn-primary">IMPORT EWB DATA</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bar */}
            <footer className="dashboard-footer-bar" style={{ marginTop: 0 }}>
                <div className="footer-left">© 2026-27 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 03-05-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>

            <div className="bottom-info-blue-bar">
                Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
            </div>
            
            {/* Scroll to top button */}
            <button 
                onClick={scrollToTop}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#1b2e4b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    zIndex: 1000
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
            </button>
        </div>
        </>
    );
};

export default GSTR1B2CLDashboard;
