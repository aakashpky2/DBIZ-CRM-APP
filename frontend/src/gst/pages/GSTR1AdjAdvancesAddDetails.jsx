import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1CDNRAddInvoice.css'; // Reusing common grid styles
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import toast, { Toaster } from 'react-hot-toast';

const GSTR1AdjAdvancesAddDetails = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        pos: '',
        supplyType: '',
        applicablePercentage: '65%',
        itemDetails: [
            { rate: '0.1%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '0.25%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '1%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '1.5%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '3%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '5%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '6%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '7.5%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '12%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '18%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '28%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
            { rate: '40%', grossAdjustment: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' },
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
                updatedData.supplyType = '';
            } else if (selectedPos.toLowerCase().includes('kerala')) {
                updatedData.supplyType = 'Intra-State';
            } else {
                updatedData.supplyType = 'Inter-State';
            }
            // Reset table on POS change
            updatedData.itemDetails = formData.itemDetails.map(item => ({
                ...item,
                grossAdjustment: '',
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
        if (field === 'grossAdjustment') {
            const adjAmt = parseFloat(value);
            const rateStr = newItemDetails[index].rate;
            const rateVal = parseFloat(rateStr.replace('%', ''));

            if (!isNaN(adjAmt) && !isNaN(rateVal)) {
                if (formData.supplyType === 'Intra-State') {
                    const halfTax = (adjAmt * (rateVal / 2)) / 100;
                    newItemDetails[index].centralTax = halfTax.toFixed(2);
                    newItemDetails[index].stateTax = halfTax.toFixed(2);
                    newItemDetails[index].integratedTax = '';
                } else {
                    const igst = (adjAmt * rateVal) / 100;
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
        const hasData = formData.itemDetails.some(item => parseFloat(item.grossAdjustment) > 0);
        
        if (!formData.pos) {
            toast.error('Please select Place of Supply (POS)');
            return;
        }

        if (!hasData) {
            toast.error('Please enter Gross Advance Adjusted for at least one rate');
            return;
        }

        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            await Promise.all(
                formData.itemDetails
                    .filter(item => parseFloat(item.grossAdjustment) > 0)
                    .map(async (item) => {
                         const payload = {
                             trn,
                             pos: formData.pos,
                             supply_type: formData.supplyType,
                             is_differential_rate: formData.differentialRate,
                             gross_advance_adjusted: item.grossAdjustment,
                             rate: item.rate,
                             integrated_tax: parseFloat(item.integratedTax) || 0,
                             central_tax: parseFloat(item.centralTax) || 0,
                             state_ut_tax: parseFloat(item.stateTax) || 0,
                             cess: parseFloat(item.cess) || 0
                         };
                        return gstr1Service.saveGstr1Record('gstr1_adj_advances', payload);
                    })
            );

            toast.success('Adjustment of Advances Record saved successfully!');
            navigate('/returns/gstr1/adjadvances');
        } catch (err) {
            toast.error('Error saving: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6' }}>
            <Toaster position="top-right" />
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Dashboard</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns-dashboard" style={{ textDecoration: 'none', color: '#167dc2' }}>Returns</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1" style={{ textDecoration: 'none', color: '#167dc2' }}>GSTR-1/IFF</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <Link to="/returns/gstr1/adjadvances" style={{ textDecoration: 'none', color: '#167dc2' }}>Adjustment of Advances</Link>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            <div className="cdnr-add-main-content">
                <div className="cdnr-add-header-banner">
                    <h2 className="cdnr-add-title">Tax already paid on invoices issued in the current period - Add Details</h2>
                </div>

                <div className="cdnr-add-body">
                    {/* Note Box */}
                    <div style={{ padding: '15px 0', borderBottom: '1px solid #eee', marginBottom: '15px' }}>
                        <p style={{ fontSize: '13px', color: '#333', margin: 0 }}>
                            <span style={{ fontWeight: '500' }}>Note:</span> Declare the amount of advance for which tax has already been paid receipt of consideration in an earlier period and invoices issued in the current period for the supplies.
                        </p>
                    </div>

                    <div className="cdnr-add-top-bar" style={{ justifyContent: 'flex-end', borderBottom: 'none', paddingBottom: '0' }}>
                        <div className="mandatory-note">
                            <span className="red-dot">•</span> Indicates Mandatory Fields
                        </div>
                    </div>

                    {/* POS and Supply Type Row */}
                    <div className="cdnr-add-form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
                        <div className="cdnr-form-group">
                            <label>
                                POS <span style={{ fontSize: '11px', border: '1px solid #111', borderRadius: '50%', width: '13px', height: '13px', display: 'inline-block', textAlign: 'center', lineHeight: '13px', marginLeft: '4px' }}>i</span> <span className="red-dot">*</span>
                            </label>
                            <select name="pos" value={formData.pos} onChange={handleChange}>
                                <option value="">Select</option>
                                {posOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="cdnr-form-group">
                            <label>Supply Type</label>
                            <input type="text" value={formData.supplyType} disabled className="disabled-input" placeholder="Supply Type" />
                        </div>
                    </div>

                    {/* Checkbox and Differential Rate Row */}
                    <div className="adv-diff-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '30px', marginTop: '25px', padding: '0 5px' }}>
                        <div style={{ flex: 2 }}>
                            <label className="cdnr-checkbox-item" style={{ alignItems: 'flex-start', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    name="differentialRate"
                                    checked={formData.differentialRate}
                                    onChange={handleChange}
                                    style={{ marginTop: '3px' }}
                                />
                                <span style={{ fontSize: '13.5px', color: '#333' }}>
                                    Is the supply eligible to be taxed at a differential percentage (%) of the existing rate of tax, as notified by the Government?
                                </span>
                            </label>
                        </div>

                        {formData.differentialRate && (
                            <div className="cdnr-form-group" style={{ flex: 1 }}>
                                <label>Applicable % of Tax Rate <span className="red-dot">*</span></label>
                                <select name="applicablePercentage" value={formData.applicablePercentage} onChange={handleChange}>
                                    <option value="65%">65%</option>
                                    <option value="100%">100%</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Item Details Table Section */}
                    {formData.pos && formData.supplyType && (
                        <div className="cdnr-add-item-details-section">
                            <h3 className="section-subtitle">Item details</h3>
                            <div className="cdnr-add-table-container">
                                <table className="cdnr-add-item-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '15%' }}>Rate (%)</th>
                                            <th style={{ width: '25%' }}>Gross Advance Adjusted (₹) <span className="red-dot">*</span></th>
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
                                                <td className="rate-cell" style={{ textAlign: 'center' }}>{item.rate}</td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.grossAdjustment}
                                                        onChange={(e) => handleItemChange(index, 'grossAdjustment', e.target.value)}
                                                        placeholder="0.00"
                                                        style={{ textAlign: 'right' }}
                                                    />
                                                </td>
                                                {formData.supplyType === 'Intra-State' ? (
                                                    <>
                                                        <td>
                                                            <input type="text" value={item.centralTax} readOnly className="disabled-input" placeholder="0.00" style={{ textAlign: 'right' }} />
                                                        </td>
                                                        <td>
                                                            <input type="text" value={item.stateTax} readOnly className="disabled-input" placeholder="0.00" style={{ textAlign: 'right' }} />
                                                        </td>
                                                    </>
                                                ) : (
                                                    <td>
                                                        <input type="text" value={item.integratedTax} readOnly className="disabled-input" placeholder="0.00" style={{ textAlign: 'right' }} />
                                                    </td>
                                                )}
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={item.cess}
                                                        onChange={(e) => handleItemChange(index, 'cess', e.target.value)}
                                                        placeholder="0.00"
                                                        style={{ textAlign: 'right' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}



                    <div className="cdnr-add-actions" style={{ marginTop: '40px' }}>
                        <button className="cdnr-btn-outline" onClick={() => navigate('/returns/gstr1/adjadvances')}>BACK</button>
                        <button className="cdnr-btn-primary" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'SAVING...' : 'SAVE'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 24-01-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>
        </div>
    );
};

export default GSTR1AdjAdvancesAddDetails;
