import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1CDNRAddInvoice.css';
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import toast, { Toaster } from 'react-hot-toast';
import CustomDatePicker from '../components/CustomDatePicker';


const GSTR1CDNRAddInvoice = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        deemedExports: false,
        sezWithPayment: false,
        sezWithoutPayment: false,
        reverseCharge: false,
        intraStateIgst: false,
        differentialRate: false,
        recipientGstin: '',
        recipientName: '',
        nameInMaster: '',
        noteNumber: '',
        noteDate: '',
        noteType: '',
        noteValue: '',
        pos: '',
        supplyType: '',
        source: '',
        irn: '',
        irnDate: '',
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

    const posOptions = [
        "01-Jammu & Kashmir", "02-Himachal Pradesh", "03-Punjab", "04-Chandigarh", "05-Uttarakhand",
        "06-Haryana", "07-Delhi", "08-Rajasthan", "09-Uttar Pradesh", "10-Bihar",
        "11-Sikkim", "12-Arunachal Pradesh", "13-Nagaland", "14-Manipur", "15-Mizoram",
        "16-Tripura", "17-Meghalaya", "18-Assam", "19-West Bengal", "20-Jharkhand",
        "21-Odisha", "22-Chhattisgarh", "23-Madhya Pradesh", "24-Gujarat", "25-Daman & Diu",
        "26-Dadra & Nagar Haveli", "27-Maharashtra", "29-Karnataka", "30-Goa", "31-Lakshadweep",
        "32-Kerala", "33-Tamil Nadu", "34-Puducherry", "35-Andaman & Nicobar Islands", "36-Telangana",
        "37-Andhra Pradesh", "38-Ladakh", "97-Other Territory"
    ];

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
                updatedData.supplyType = 'Inter-State';
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
        // Strict Rules: Accept only numeric input values for taxableValue and taxes
        if (['taxableValue', 'centralTax', 'stateTax', 'integratedTax', 'cess'].includes(field)) {
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
        }

        const newItemDetails = [...formData.itemDetails];
        newItemDetails[index][field] = value;

        // Auto-mirror Central Tax into State/UT Tax
        if (field === 'centralTax') {
            newItemDetails[index].stateTax = value;
        }

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
        if (!formData.recipientGstin || !formData.noteNumber || !formData.noteDate || !formData.noteType || !formData.noteValue || !formData.pos) {
            toast.error('Please fill all mandatory fields marked with *');
            return;
        }

        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            const payload = {
                trn,
                recipient_gstin: formData.recipientGstin,
                recipient_name: formData.recipientName,
                name_in_master: formData.nameInMaster,
                note_number: formData.noteNumber,
                note_date: formData.noteDate,
                note_type: formData.noteType,
                note_value: formData.noteValue,
                pos: formData.pos,
                supply_type: formData.supplyType,
                source: formData.source,
                irn: formData.irn,
                irn_date: formData.irnDate,
                is_deemed_export: formData.deemedExports,
                is_sez_with_payment: formData.sezWithPayment,
                is_sez_without_payment: formData.sezWithoutPayment,
                is_reverse_charge: formData.reverseCharge,
                is_intra_state_igst: formData.intraStateIgst,
                is_differential_rate: formData.differentialRate,
                tax_items: formData.itemDetails.filter(item => item.taxableValue !== '')
            };

            const res = await gstr1Service.saveGstr1Record('gstr1_cdnr_invoices', payload);

            if (res.success) {
                toast.success('CDNR Record saved successfully!');
                navigate('/returns/gstr1/cdnr');
            } else {
                toast.error('Failed to save record');
            }
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
                    <Link to="/returns/gstr1/cdnr" style={{ textDecoration: 'none', color: '#167dc2' }}>CDNR</Link>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="cdnr-add-main-content">
                {/* Header Banner - Cyan */}
                <div className="cdnr-add-header-banner">
                    <h2 className="cdnr-add-title">Credit/Debit Notes (Registered)- Add Note</h2>
                </div>

                <div className="cdnr-add-body">
                    <div className="cdnr-add-top-bar">
                        <button className="cdnr-add-back-arrow" onClick={() => navigate('/returns/gstr1/cdnr')}>
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <div className="mandatory-note">
                            <span className="red-dot">•</span> Indicates Mandatory Fields
                        </div>
                    </div>

                    {/* Checkboxes Area */}
                    <div className="cdnr-checkbox-grid">
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="deemedExports" checked={formData.deemedExports} onChange={handleChange} />
                            Deemed Exports
                        </label>
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="sezWithPayment" checked={formData.sezWithPayment} onChange={handleChange} />
                            SEZ Supplies with payment
                        </label>
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="sezWithoutPayment" checked={formData.sezWithoutPayment} onChange={handleChange} />
                            SEZ Supplies without payment
                        </label>
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="reverseCharge" checked={formData.reverseCharge} onChange={handleChange} />
                            Supply attract reverse charge
                        </label>
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="intraStateIgst" checked={formData.intraStateIgst} onChange={handleChange} />
                            Intra-State Supplies attracting IGST
                        </label>
                    </div>

                    <div className="cdnr-differential-section">
                        <label className="cdnr-checkbox-item">
                            <input type="checkbox" name="differentialRate" checked={formData.differentialRate} onChange={handleChange} />
                            Is the supply eligible to be taxed at a differential percentage (%) of the existing rate of tax, as notified by the Government?
                        </label>
                    </div>

                    {/* Form Grid */}
                    <div className="cdnr-add-form-grid">
                        <div className="cdnr-form-group">
                            <label>Recipient GSTIN/UIN <span className="red-dot">*</span></label>
                            <input
                                type="text"
                                name="recipientGstin"
                                value={formData.recipientGstin}
                                onChange={handleChange}
                                placeholder="Search by recipient name as in master or er"
                            />
                        </div>
                        <div className="cdnr-form-group">
                            <label>Recipient Name</label>
                            <input type="text" value={formData.recipientName} disabled className="disabled-input" />
                        </div>
                        <div className="cdnr-form-group">
                            <label>Name as in Master</label>
                            <input type="text" value={formData.nameInMaster} disabled className="disabled-input" />
                        </div>

                        <div className="cdnr-form-group">
                            <label>Debit/Credit Note No. <span className="red-dot">*</span></label>
                            <input type="text" name="noteNumber" value={formData.noteNumber} onChange={handleChange} />
                        </div>
                        <div className="cdnr-form-group">
                            <label>Debit/Credit Note Date <span className="red-dot">*</span></label>
                            <CustomDatePicker 
                                value={formData.noteDate} 
                                onChange={(val) => setFormData(prev => ({...prev, noteDate: val}))} 
                            />
                        </div>

                        <div className="cdnr-form-group">
                            <label>Note Type <span className="red-dot">*</span></label>
                            <select name="noteType" value={formData.noteType} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Credit">Credit</option>
                                <option value="Debit">Debit</option>
                            </select>
                        </div>

                        <div className="cdnr-form-group">
                            <label>Note value (₹) <span className="red-dot">*</span></label>
                            <input type="text" name="noteValue" value={formData.noteValue} onChange={handleChange} />
                        </div>
                        <div className="cdnr-form-group">
                            <label>POS <span style={{ fontSize: '11px', border: '1px solid #111', borderRadius: '50%', width: '13px', height: '13px', display: 'inline-block', textAlign: 'center', lineHeight: '13px', marginLeft: '4px' }}>i</span> <span className="red-dot">*</span></label>
                            <select name="pos" value={formData.pos} onChange={handleChange}>
                                <option value="">Select</option>
                                {posOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="cdnr-form-group">
                            <label>Supply Type</label>
                            <input type="text" value={formData.supplyType} disabled className="disabled-input" />
                        </div>

                        <div className="cdnr-form-group">
                            <label>Source</label>
                            <input type="text" value={formData.source} disabled className="disabled-input" />
                        </div>
                        <div className="cdnr-form-group">
                            <label>IRN</label>
                            <input type="text" value={formData.irn} disabled className="disabled-input" />
                        </div>
                        <div className="cdnr-form-group">
                            <label>IRN date</label>
                            <input type="text" value={formData.irnDate} disabled className="disabled-input" />
                        </div>
                    </div>
                    
                    {/* Item Details Table Section */}
                    <div className="cdnr-add-item-details-section">
                        <h3 className="section-subtitle">Item details</h3>
                        <div className="cdnr-add-table-container">
                            <table className="cdnr-add-item-table">
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
                                        <th style={{ width: '20%' }}>CESS (₹)</th>
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
                                                            onChange={(e) => handleItemChange(index, 'centralTax', e.target.value)}
                                                            placeholder="0.00"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.stateTax}
                                                            onChange={(e) => handleItemChange(index, 'stateTax', e.target.value)}
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
                                                        className={item.integratedTax ? 'disabled-input' : ''}
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

                    <div className="cdnr-add-actions">
                        <button className="cdnr-btn-outline" onClick={() => navigate('/returns/gstr1/cdnr')}>BACK</button>
                        <button className="cdnr-btn-primary" onClick={handleSave} disabled={isSaving}>
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

export default GSTR1CDNRAddInvoice;
