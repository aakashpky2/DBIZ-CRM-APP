import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1ExportsAddInvoice.css'; // Specific styles for this page
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import toast, { Toaster } from 'react-hot-toast';
import CustomDatePicker from '../components/CustomDatePicker';


const GSTR1ExportsAddInvoice = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        invoiceNo: '',
        invoiceDate: '',
        portCode: '',
        shippingBillNo: '',
        shippingBillDate: '',
        totalInvoiceValue: '',
        supplyType: 'Inter-State',
        gstPayment: 'With Payment of Tax',
        itemDetails: [
            { rate: '0%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '0.1%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '0.25%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '1%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '1.5%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '3%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '5%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '6%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '7.5%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '12%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '18%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '28%', taxableValue: '', integratedTax: '', cess: '' },
            { rate: '40%', taxableValue: '', integratedTax: '', cess: '' },
        ]
    });

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            
            // If payment type changes to "Without Payment", clear all Integrated Tax
            if (name === 'gstPayment' && value === 'Without Payment of Tax') {
                updated.itemDetails = updated.itemDetails.map(item => ({
                    ...item,
                    integratedTax: '0.00'
                }));
            } else if (name === 'gstPayment' && value === 'With Payment of Tax') {
                // Re-calculate Integrated Tax for all rows
                updated.itemDetails = updated.itemDetails.map(item => {
                    const taxableAmt = parseFloat(item.taxableValue);
                    const rateVal = parseFloat(item.rate.replace('%', ''));
                    if (!isNaN(taxableAmt) && !isNaN(rateVal)) {
                        return { ...item, integratedTax: ((taxableAmt * rateVal) / 100).toFixed(2) };
                    }
                    return item;
                });
            }
            
            return updated;
        });
    };

    const handleItemChange = (index, field, value) => {
        const newItemDetails = [...formData.itemDetails];
        newItemDetails[index][field] = value;

        // Instant Calculation Logic
        if (field === 'taxableValue') {
            if (value === '' || value === null) {
                // If cleared, reset to 0.00
                newItemDetails[index].integratedTax = '0.00';
            } else {
                const taxableAmt = parseFloat(value);
                const rateStr = newItemDetails[index].rate;
                const rateVal = parseFloat(rateStr.replace('%', ''));

                if (!isNaN(taxableAmt) && taxableAmt >= 0 && !isNaN(rateVal)) {
                    if (formData.gstPayment === 'Without Payment of Tax') {
                        newItemDetails[index].integratedTax = '0.00';
                    } else {
                        const igst = (taxableAmt * rateVal) / 100;
                        newItemDetails[index].integratedTax = igst.toFixed(2);
                    }
                } else if (taxableAmt < 0) {
                    // Invalid or negative, do not calculate (reset or leave as is)
                    newItemDetails[index].integratedTax = '0.00';
                }
            }
        }

        setFormData(prev => ({ ...prev, itemDetails: newItemDetails }));
    };

    const handleSave = async () => {
        if (!formData.invoiceNo || !formData.invoiceDate || !formData.totalInvoiceValue || !formData.gstPayment) {
            toast.error('Please fill all mandatory fields marked with *');
            return;
        }

        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            const payload = {
                trn,
                invoice_no: formData.invoiceNo,
                invoice_date: formData.invoiceDate,
                total_invoice_value: formData.totalInvoiceValue,
                port_code: formData.portCode,
                shipping_bill_no: formData.shippingBillNo,
                shipping_bill_date: formData.shippingBillDate,
                gst_payment: formData.gstPayment,
                item_details: formData.itemDetails.filter(item => item.taxableValue !== '')
            };

            const res = await gstr1Service.saveGstr1Record('gstr1_exports_invoices', payload);

            if (res.success) {
                toast.success('Export Invoice saved successfully!');
                navigate('/returns/gstr1/exports');
            } else {
                toast.error('Failed to save invoice');
            }
        } catch (err) {
            toast.error('Error saving: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="dashboard-container" onClick={handleBackdropClick} style={{ backgroundColor: '#f1f3f6' }}>
            <Toaster position="top-right" />
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
            <div className="exports-add-main-content">

                {/* Header Banner */}
                <div className="exports-add-header-banner">
                    <h2 className="exports-add-title">Exports - Add Details</h2>
                </div>

                <div className="exports-add-content-body">
                    <div className="exports-add-top-bar">
                        <button className="exports-add-back-arrow" onClick={() => navigate('/returns/gstr1/exports')}>
                            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <div className="exports-add-mandatory-note">
                            <span className="red-dot">•</span> Indicates Mandatory Fields
                        </div>
                    </div>

                    {/* Form Fields Section */}
                    <div className="exports-add-form-grid">
                        <div className="exports-add-form-group">
                            <label>Invoice no. <span className="red-dot">*</span></label>
                            <input
                                type="text"
                                name="invoiceNo"
                                value={formData.invoiceNo}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="exports-add-form-group">
                            <label>Invoice date <span className="red-dot">*</span></label>
                            <CustomDatePicker 
                                value={formData.invoiceDate} 
                                onChange={(val) => setFormData(prev => ({...prev, invoiceDate: val}))} 
                            />
                        </div>

                        <div className="exports-add-form-group">
                            <label>Port Code</label>
                            <input
                                type="text"
                                name="portCode"
                                value={formData.portCode}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="exports-add-form-group">
                            <label>Shipping Bill No./Bill of Export No.</label>
                            <input
                                type="text"
                                name="shippingBillNo"
                                value={formData.shippingBillNo}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="exports-add-form-group">
                            <label>Shipping Bill Date/Bill of Export Date</label>
                            <CustomDatePicker 
                                value={formData.shippingBillDate} 
                                onChange={(val) => setFormData(prev => ({...prev, shippingBillDate: val}))} 
                            />
                        </div>

                        <div className="exports-add-form-group">
                            <label>Total invoice value (₹) <span className="red-dot">*</span></label>
                            <input
                                type="text"
                                name="totalInvoiceValue"
                                value={formData.totalInvoiceValue}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="exports-add-form-group">
                            <label>Supply Type</label>
                            <input type="text" value={formData.supplyType} disabled className="exports-add-disabled-input" />
                        </div>
                        <div className="exports-add-form-group">
                            <label>GST Payment <span className="red-dot">*</span></label>
                            <select name="gstPayment" value={formData.gstPayment} onChange={handleChange}>
                                <option value="With Payment of Tax">With Payment of Tax</option>
                                <option value="Without Payment of Tax">Without Payment of Tax</option>
                            </select>
                        </div>
                        <div className="exports-add-form-group">
                            <label>Source</label>
                            <input type="text" value="" disabled className="exports-add-disabled-input" />
                        </div>
                        <div className="exports-add-form-group">
                            <label>IRN</label>
                            <input type="text" value="" disabled className="exports-add-disabled-input" />
                        </div>
                        <div className="exports-add-form-group">
                            <label>IRN date</label>
                            <input type="text" value="" disabled className="exports-add-disabled-input" />
                        </div>
                    </div>

                    {/* Item Details Table Section */}
                    <div className="exports-add-item-details-section">
                        <h3 className="exports-add-section-title">Item details</h3>
                        <div className="exports-add-table-container">
                            <table className="exports-add-item-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}>Rate</th>
                                        <th style={{ width: '30%' }}>Taxable value (₹) <span className="red-dot">*</span></th>
                                        <th colSpan="2" style={{ textAlign: 'center' }}>Amount of tax</th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th style={{ width: '25%' }}>Integrated tax (₹) <span className="red-dot">*</span></th>
                                        <th style={{ width: '25%' }}>CESS (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.itemDetails.map((item, index) => (
                                        <tr key={index}>
                                            <td className="rate-cell">{item.rate}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.taxableValue}
                                                    onChange={(e) => handleItemChange(index, 'taxableValue', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.integratedTax}
                                                    readOnly
                                                    className="exports-add-disabled-input"
                                                    placeholder="0.00"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.cess}
                                                    onChange={(e) => handleItemChange(index, 'cess', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="exports-add-actions">
                        <button className="exports-add-btn-outline" onClick={() => navigate('/returns/gstr1/exports')}>BACK</button>
                        <button className="exports-add-btn-primary" onClick={handleSave} disabled={isSaving}>
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

            <div className="bottom-info-blue-bar">
                Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
            </div>
        </div>
    );
};

export default GSTR1ExportsAddInvoice;
