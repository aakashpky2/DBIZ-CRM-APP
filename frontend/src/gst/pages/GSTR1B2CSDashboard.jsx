import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1Dashboard.css'; // Reusing info block and basic styles
import './GSTR1B2CSDashboard.css'; // B2CS specific styles
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import PageLoader from '../components/PageLoader';

const GSTR1B2CSDashboard = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleRefresh = () => {
        setLoading(true);
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await gstr1Service.getGstr1Records('gstr1_b2cs_invoices', trn);

                if (res.success && res.data) {
                    setInvoices(res.data);
                } else {
                    setInvoices([]);
                }
            } catch (error) {
                console.error("Failed to fetch B2CS invoices");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    return (
        <>
        <PageLoader loading={loading} />
        <div className="dashboard-container" onClick={handleBackdropClick} style={{ backgroundColor: '#f1f3f6' }}>
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#3b82f6' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>B2CS</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="gstr1-main-content b2cs-main-content" style={{ width: '90%', margin: '15px auto 0 auto', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Cyan Header Banner */}
                    <div className="b2cs-header-banner" style={{ marginTop: 0 }}>
                        <div className="b2cs-header-top">
                            <h2 className="b2cs-title">7 - B2C (Others)</h2>
                            <div className="gstr1-header-actions">
                                <button className="gstr1-btn-secondary">HELP <span style={{ fontSize: '12px', border: '1px solid #fff', borderRadius: '50%', padding: '0 4px', marginLeft: '4px' }}>?</span></button>
                                <button className="gstr1-btn-icon" onClick={handleRefresh}>↻</button>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Records Box */}
                    {loading ? (
                        <div className="b2cs-empty-records" style={{ textAlign: 'center' }}>Loading...</div>
                    ) : invoices.length === 0 ? (
                        <div className="b2cs-empty-records">
                            There are no records to be displayed.
                        </div>
                    ) : (
                        <div className="b2cs-records-table-container">
                            <div style={{ padding: '10px 15px', backgroundColor: '#e0f2fe', borderBottom: '1px solid #bae6fd', fontSize: '14px', fontWeight: '500', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <span>Total Records: {invoices.length}</span>
                                <span>Total Taxable Value: ₹{invoices.reduce((sum, inv) => sum + parseFloat(inv.taxable_value || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span>Total IGST: ₹{invoices.reduce((sum, inv) => {
                                    const tax = parseFloat(inv.taxable_value || 0);
                                    const rate = parseFloat((inv.rate || '0%').replace('%', ''));
                                    return sum + (inv.supply_type === 'Inter-State' ? (tax * rate) / 100 : 0);
                                }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span>Total CGST: ₹{invoices.reduce((sum, inv) => {
                                    const tax = parseFloat(inv.taxable_value || 0);
                                    const rate = parseFloat((inv.rate || '0%').replace('%', ''));
                                    return sum + (inv.supply_type !== 'Inter-State' ? (tax * (rate / 2)) / 100 : 0);
                                }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span>Total SGST: ₹{invoices.reduce((sum, inv) => {
                                    const tax = parseFloat(inv.taxable_value || 0);
                                    const rate = parseFloat((inv.rate || '0%').replace('%', ''));
                                    return sum + (inv.supply_type !== 'Inter-State' ? (tax * (rate / 2)) / 100 : 0);
                                }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span>Total CESS: ₹0.00</span>
                            </div>
                            <table className="b2cs-records-table">
                                <thead>
                                    <tr>
                                        <th>POS</th>
                                        <th>Supply Type</th>
                                        <th>Taxable Value (₹)</th>
                                        <th>Integrated tax (₹)</th>
                                        <th>Central tax (₹)</th>
                                        <th>State/UT tax (₹)</th>
                                        <th>Cess (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv, idx) => {
                                        const taxableAmt = parseFloat(inv.taxable_value || 0);
                                        const rateStr = inv.rate || '0%';
                                        const rateVal = parseFloat(rateStr.replace('%', ''));
                                        
                                        let igst = 0, cgst = 0, sgst = 0;
                                        const supplyType = inv.supply_type || 'Intra-State';
                                        
                                        if (!isNaN(taxableAmt) && !isNaN(rateVal)) {
                                            if (supplyType === 'Intra-State') {
                                                const halfTax = (taxableAmt * (rateVal / 2)) / 100;
                                                cgst = halfTax;
                                                sgst = halfTax;
                                            } else {
                                                igst = (taxableAmt * rateVal) / 100;
                                            }
                                        }

                                        return (
                                            <tr key={inv.id || idx}>
                                                <td>{inv.pos}</td>
                                                <td>{supplyType}</td>
                                                <td>₹{taxableAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td>₹{igst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td>₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td>₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td>₹0.00</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="b2cs-actions-row">
                        <button className="b2cs-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                        <button className="b2cs-btn-primary" onClick={() => navigate('/returns/gstr1/b2cs/add')}>ADD RECORD</button>
                        <button className="b2cs-btn-primary">IMPORT EWB DATA</button>
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
        </div>
        </>
    );
};

export default GSTR1B2CSDashboard;
