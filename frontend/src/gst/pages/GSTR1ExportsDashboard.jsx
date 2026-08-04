import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1Dashboard.css'; // Reusing info block and basic styles
import './GSTR1ExportsDashboard.css'; // Exports specific styles
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import PageLoader from '../components/PageLoader';

const GSTR1ExportsDashboard = () => {
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
    const [showModal, setShowModal] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const res = await gstr1Service.getGstr1Records('gstr1_exports_invoices', trn);

                if (res.success && res.data) {
                    setInvoices(res.data);
                } else {
                    setInvoices([]);
                }
            } catch (error) {
                console.error("Failed to fetch exports invoices");
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
                    <span style={{ color: '#4b5563' }}>EXP</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="gstr1-main-content exports-main-content">
                {/* Cyan Header Banner */}
                <div className="exports-header-banner">
                    <div className="exports-header-top">
                        <h2 className="exports-title">6A - Exports Invoices</h2>
                        <div className="gstr1-header-actions">
                            <button className="gstr1-btn-secondary">HELP <span style={{ fontSize: '12px', border: '1px solid #fff', borderRadius: '50%', padding: '0 4px', marginLeft: '4px' }}>?</span></button>
                            <button className="gstr1-btn-icon" onClick={handleRefresh}>↻</button>
                        </div>
                    </div>
                </div>

                {/* Dynamic Records Box */}
                {loading ? (
                    <div className="exports-empty-records" style={{ textAlign: 'center' }}>Loading...</div>
                ) : invoices.length === 0 ? (
                    <div className="exports-empty-records">
                        There are no records to be displayed.
                    </div>
                ) : (
                    <div className="exports-records-table-container">
                        <table className="exports-records-table">
                            <thead>
                                <tr>
                                    <th>Invoice No.</th>
                                    <th>Invoice Date</th>
                                    <th>Port Code</th>
                                    <th>Shipping Bill No.</th>
                                    <th>Total Invoice Value (₹)</th>
                                    <th>Export Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv, idx) => (
                                    <tr key={inv.id || idx}>
                                        <td>{inv.invoice_no}</td>
                                        <td>{inv.invoice_date}</td>
                                        <td>{inv.port_code || '-'}</td>
                                        <td>{inv.shipping_bill_no || '-'}</td>
                                        <td>₹{parseFloat(inv.total_invoice_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td>{inv.gst_payment === 'With Payment of Tax' ? 'With Payment of Tax (WPAY)' : inv.gst_payment === 'Without Payment of Tax' ? 'Without Payment of Tax (WOPAY)' : inv.gst_payment}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Bottom Actions */}
                <div className="exports-actions-row">
                    <button className="exports-btn-outline" onClick={() => navigate('/returns/gstr1')}>BACK</button>
                    <button className="exports-btn-primary" onClick={() => navigate('/returns/gstr1/exports/add')}>ADD RECORD</button>
                    <button className="exports-btn-primary">IMPORT EWB DATA</button>
                </div>
            </div>

            {/* Guidelines Modal */}
            {showModal && (
                <div className="exports-modal-overlay">
                    <div className="exports-modal-content">
                        <h3 className="exports-modal-title">Please confirm below guidelines for refund of IGST paid on export of goods:</h3>
                        <ol className="exports-modal-list">
                            <li>Invoice data for export of goods is provided in Table 6A of GSTR-1 for the relevant tax period.</li>
                            <li>Invoice numbers provided in Table-6A of GSTR-1 are same as that of the invoice details given in Shipping Bill.
                                <br /><strong>(The invoice with different invoice number/date than given in shipping bill will be rejected by ICEGATE)</strong>
                            </li>
                            <li>Select With payment of tax from the GST Payment drop down when filling the invoice details.
                                <br /><strong>(Invoices selected as without payment of tax are not eligible for refund from ICEGATE)</strong>
                            </li>
                            <li>Shipping bill number, shipping bill date and port code are specified mandatorily and correctly, in case of export of goods.
                                <br /><strong>(Invoices, which don't have these details, shall not be sent to ICEGATE for further processing)</strong>
                            </li>
                            <li>Port code is alphanumeric six character code as prescribed by ICEGATE.
                                <br />Refer to the list given by ICEGATE at:
                                <br /><a href="https://www.icegate.gov.in/SMTPList.html" target="_blank" rel="noopener noreferrer">https://www.icegate.gov.in/SMTPList.html</a>
                                <br /><br /><strong>(Invoice, which have incorrect port code, are likely to get rejected by ICEGATE)</strong>
                            </li>
                        </ol>
                        <div className="exports-modal-actions">
                            <button className="exports-modal-btn" onClick={() => setShowModal(false)}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ flexGrow: 1 }}></div>

            {/* Footer Bar */}
            <footer className="dashboard-footer-bar">
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

export default GSTR1ExportsDashboard;
