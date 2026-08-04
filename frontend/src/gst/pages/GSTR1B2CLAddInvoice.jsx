import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing nav and footer styles
import './GSTR1B2CLAddInvoice.css'; // Specific styles for this page
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import toast, { Toaster } from 'react-hot-toast';
import CustomDatePicker from '../components/CustomDatePicker';


const GSTR1B2CLAddInvoice = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        isDifferential: false,
        pos: 'Select',
        invoiceNo: '',
        invoiceDate: '',
        supplyType: 'Inter-State',
        totalInvoiceValue: '',
        itemDetails: [
            { rate: '0%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '0.1%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '0.25%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '1%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '1.5%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '3%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '5%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '6%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '7.5%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '12%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '18%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '28%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '40%', taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
        ]
    });

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let updatedData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };

        if (name === 'pos') {
            const selectedPos = value || '';
            if (selectedPos === 'Select' || selectedPos === '') {
                updatedData.supplyType = 'Inter-State';
            } else if (selectedPos.toLowerCase().includes('kerala')) {
                updatedData.supplyType = 'Intra-State';
            } else {
                updatedData.supplyType = 'Inter-State'; // B2CL is primarily Inter-State
            }

            // Clear all values when POS changes
            updatedData.itemDetails = formData.itemDetails.map(item => ({
                ...item,
                taxableValue: '',
                integratedTax: '',
                centralTax: '',
                stateTax: '',
                cess: ''
            }));
        }

        setFormData(updatedData);
    };

    const handleItemChange = (index, field, value) => {
        const newItemDetails = [...formData.itemDetails];
        newItemDetails[index][field] = value;

        // Instant Calculation Logic
        if (field === 'taxableValue') {
            const taxableAmt = parseFloat(value);
            const rateStr = newItemDetails[index].rate; // e.g. "5%"
            const rateVal = parseFloat(rateStr.replace('%', ''));

            if (!isNaN(taxableAmt) && !isNaN(rateVal)) {
                if (formData.supplyType === 'Intra-State') {
                    // Split rate equally for Central and State tax
                    const halfTax = (taxableAmt * (rateVal / 2)) / 100;
                    const formattedTax = halfTax.toFixed(2);
                    newItemDetails[index].centralTax = formattedTax;
                    newItemDetails[index].stateTax = formattedTax;
                    newItemDetails[index].integratedTax = '';
                } else {
                    // Integrated Tax = (Taxable Value × Rate %) / 100
                    const igst = (taxableAmt * rateVal) / 100;
                    newItemDetails[index].integratedTax = igst.toFixed(2);
                    newItemDetails[index].centralTax = '';
                    newItemDetails[index].stateTax = '';
                }
            } else {
                newItemDetails[index].integratedTax = '';
                newItemDetails[index].centralTax = '';
                newItemDetails[index].stateTax = '';
            }
        }

        setFormData(prev => ({ ...prev, itemDetails: newItemDetails }));
    };

    const handleSave = async () => {
        if (formData.pos === 'Select' || !formData.invoiceNo || !formData.invoiceDate || !formData.totalInvoiceValue) {
            toast.error('Please fill all mandatory fields marked with *');
            return;
        }

        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            const payload = {
                trn,
                pos: formData.pos,
                invoice_no: formData.invoiceNo,
                invoice_date: formData.invoiceDate,
                total_invoice_value: formData.totalInvoiceValue,
                supply_type: formData.supplyType,
                is_differential: formData.isDifferentialPercentage,
                item_details: formData.itemDetails.filter(item => item.taxableValue !== '')
            };

            const res = await gstr1Service.saveGstr1Record('gstr1_b2cl_invoices', payload);

            if (res.success) {
                toast.success('B2CL Invoice saved successfully!');
                navigate('/returns/auth/gstr1/b2cl/summary');
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
                    <span style={{ color: '#4b5563' }}>B2CL</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="b2cl-add-main-content">

                {/* Header Banner */}
                <div className="b2cl-add-header-banner">
                    <h2 className="b2cl-add-title">B2C(Large) Invoices- Details</h2>
                </div>

                <div className="b2cl-add-content-body">
                    <div className="b2cl-add-top-bar">
                        <button className="b2cl-add-back-arrow" onClick={() => navigate('/returns/auth/gstr1/b2cl/summary')}>
                            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <div className="b2cl-add-mandatory-note">
                            <span className="red-dot">•</span> Indicates Mandatory Fields
                        </div>
                    </div>

                    {/* Checkbox Section */}
                    <div className="b2cl-add-section">
                        <label className="b2cl-add-checkbox-label">
                            <input
                                type="checkbox"
                                name="isDifferential"
                                checked={formData.isDifferential}
                                onChange={handleChange}
                            />
                            Is the supply eligible to be taxed at a differential percentage (%) of the existing rate of tax, as notified by the Government?
                        </label>
                    </div>

                    {/* Form Fields Section */}
                    <div className="b2cl-add-form-grid">
                        <div className="b2cl-add-form-group">
                            <label>POS <span className="info-circle" title="Place of Supply">i</span> <span className="red-dot">*</span></label>
                            <select name="pos" value={formData.pos} onChange={handleChange}>
                                <option>Select</option>
                                <option>01-Jammu & Kashmir</option>
                                <option>02-Himachal Pradesh</option>
                                <option>03-Punjab</option>
                                <option>04-Chandigarh</option>
                                <option>05-Uttarakhand</option>
                                <option>06-Haryana</option>
                                <option>07-Delhi</option>
                                <option>08-Rajasthan</option>
                                <option>09-Uttar Pradesh</option>
                                <option>10-Bihar</option>
                                <option>11-Sikkim</option>
                                <option>12-Arunachal Pradesh</option>
                                <option>13-Nagaland</option>
                                <option>14-Manipur</option>
                                <option>15-Mizoram</option>
                                <option>16-Tripura</option>
                                <option>17-Meghalaya</option>
                                <option>18-Assam</option>
                                <option>19-West Bengal</option>
                                <option>20-Jharkhand</option>
                                <option>21-Odisha</option>
                                <option>22-Chhattisgarh</option>
                                <option>23-Madhya Pradesh</option>
                                <option>24-Gujarat</option>
                                <option>25-Daman & Diu</option>
                                <option>26-Dadra & Nagar Haveli</option>
                                <option>27-Maharashtra</option>
                                <option>29-Karnataka</option>
                                <option>30-Goa</option>
                                <option>31-Lakshadweep</option>
                                <option>32-Kerala</option>
                                <option>33-Tamil Nadu</option>
                                <option>34-Puducherry</option>
                                <option>35-Andaman & Nicobar Islands</option>
                                <option>36-Telangana</option>
                                <option>37-Andhra Pradesh</option>
                                <option>38-Ladakh</option>
                                <option>97-Other Territory</option>
                            </select>
                        </div>
                        <div className="b2cl-add-form-group">
                            <label>Invoice no. <span className="red-dot">*</span></label>
                            <input
                                type="text"
                                name="invoiceNo"
                                value={formData.invoiceNo}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="b2cl-add-form-group">
                            <label>Invoice date <span className="red-dot">*</span></label>
                            <CustomDatePicker 
                                value={formData.invoiceDate} 
                                onChange={(val) => setFormData(prev => ({...prev, invoiceDate: val}))} 
                            />
                        </div>

                        <div className="b2cl-add-form-group">
                            <label>Supply Type</label>
                            <input type="text" value={formData.supplyType} disabled className="b2cl-add-disabled-input" />
                        </div>
                        <div className="b2cl-add-form-group">
                            <label>Total invoice value (₹) <span className="red-dot">*</span></label>
                            <input
                                type="text"
                                name="totalInvoiceValue"
                                value={formData.totalInvoiceValue}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Item Details Table Section */}
                    <div className="b2cl-add-item-details-section">
                        <h3 className="b2cl-add-section-title">Item details</h3>
                        <div className="b2cl-add-table-container">
                            <table className="b2cl-add-item-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '15%' }}>Rate (%)</th>
                                        <th style={{ width: '25%' }}>Taxable value (₹) <span className="red-dot">*</span></th>
                                        <th colSpan={formData.supplyType === 'Intra-State' ? 3 : 2} style={{ textAlign: 'center' }}>Amount of Tax</th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        {formData.supplyType === 'Intra-State' ? (
                                            <>
                                                <th style={{ width: '20%' }}>Central tax (₹) <span className="red-dot">*</span></th>
                                                <th style={{ width: '20%' }}>State/UT tax (₹) <span className="red-dot">*</span></th>
                                            </>
                                        ) : (
                                            <th style={{ width: '20%' }}>Integrated tax (₹) <span className="red-dot">*</span></th>
                                        )}
                                        <th style={{ width: '20%' }}>Cess (₹)</th>
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
                                            {formData.supplyType === 'Intra-State' ? (
                                                <>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.centralTax}
                                                        readOnly
                                                        className={(item.centralTax) ? 'b2cl-add-disabled-input' : ''}
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.stateTax}
                                                        readOnly
                                                        className={(item.stateTax) ? 'b2cl-add-disabled-input' : ''}
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                                </>
                                            ) : (
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.integratedTax}
                                                        readOnly
                                                        className={item.integratedTax ? 'b2cl-add-disabled-input' : ''}
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                            )}
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

                    <div className="b2cl-add-actions">
                        <button className="b2cl-add-btn-outline" onClick={() => navigate('/returns/auth/gstr1/b2cl/summary')}>BACK</button>
                        <button className="b2cl-add-btn-primary" onClick={handleSave} disabled={isSaving}>
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

export default GSTR1B2CLAddInvoice;
