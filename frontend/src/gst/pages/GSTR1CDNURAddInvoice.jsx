import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1CDNRAddInvoice.css'; // Reusing common grid styles
import './GSTR1CDNURAddInvoice.css'; // Specific table styles
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import toast, { Toaster } from 'react-hot-toast';
import CustomDatePicker from '../components/CustomDatePicker';


const GSTR1CDNURAddInvoice = () => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    const rates = ["0%", "0.1%", "0.25%", "1%", "1.5%", "3%", "5%", "6%", "7.5%", "12%", "18%", "28%", "40%"];

    const [formData, setFormData] = useState({
        differentialRate: false,
        type: 'B2CL',
        noteNumber: '',
        noteDate: '',
        noteValue: '0.00',
        noteType: '',
        pos: '',
        supplyType: 'Inter-State',
        source: '',
        irn: '',
        irnDate: ''
    });

    const [taxData, setTaxData] = useState(
        rates.reduce((acc, rate) => {
            acc[rate] = { taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' };
            return acc;
        }, {})
    );

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

    const typeOptions = ["B2CL", "Exports with Payment", "Exports without Payment"];

    const handleFormChange = (e) => {
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

            // Clear all tax values when POS changes
            const resetTaxData = rates.reduce((acc, rate) => {
                acc[rate] = { taxableValue: '', integratedTax: '', centralTax: '', stateTax: '', cess: '' };
                return acc;
            }, {});
            setTaxData(resetTaxData);
        }

        setFormData(updatedData);
    };

    const handleTaxChange = (rate, field, value) => {
        setTaxData(prev => {
            const newRateData = { ...prev[rate], [field]: value };

            // Instant Calculation Logic
            if (field === 'taxableValue') {
                const taxableAmt = parseFloat(value);
                const rateVal = parseFloat(rate.replace('%', ''));

                if (!isNaN(taxableAmt) && !isNaN(rateVal)) {
                    if (formData.supplyType === 'Intra-State') {
                        // Split rate equally for Central and State tax
                        const halfTax = (taxableAmt * (rateVal / 2)) / 100;
                        const formattedTax = halfTax.toFixed(2);
                        newRateData.centralTax = formattedTax;
                        newRateData.stateTax = formattedTax;
                        newRateData.integratedTax = '';
                    } else {
                        // Integrated Tax = (Taxable Value × Rate %) / 100
                        const igst = (taxableAmt * rateVal) / 100;
                        newRateData.integratedTax = igst.toFixed(2);
                        newRateData.centralTax = '';
                        newRateData.stateTax = '';
                    }
                } else {
                    newRateData.integratedTax = '';
                    newRateData.centralTax = '';
                    newRateData.stateTax = '';
                }
            }

            return {
                ...prev,
                [rate]: newRateData
            };
        });
    };

    const handleSave = async () => {
        if (!formData.noteNumber || !formData.noteDate || !formData.noteType || formData.pos === 'Select') {
            toast.error('Please fill all mandatory fields marked with *');
            return;
        }

        setIsSaving(true);
        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            const item_details = Object.keys(taxData)
                .filter(rate => taxData[rate].taxableValue !== '')
                .map(rate => ({
                    rate,
                    ...taxData[rate]
                }));

            const payload = {
                trn,
                unregistered_type: formData.type,
                note_number: formData.noteNumber,
                note_date: formData.noteDate,
                note_type: formData.noteType,
                note_value: formData.noteValue || 0,
                pos: formData.pos,
                supply_type: formData.supplyType,
                is_differential_rate: formData.differentialRate,
                source: formData.source,
                irn: formData.irn,
                irn_date: formData.irnDate,
                tax_details: item_details
            };

            const res = await gstr1Service.saveGstr1Record('gstr1_cdnur_invoices', payload);

            if (res.success) {
                toast.success('CDNUR Record saved successfully!');
                navigate('/returns/gstr1/cdnur');
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
                    <Link to="/returns/gstr1/cdnur" style={{ textDecoration: 'none', color: '#167dc2' }}>CDNUR</Link>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="cdnr-add-main-content" style={{ marginBottom: '40px' }}>
                {/* Header Banner - Cyan */}
                <div className="cdnr-add-header-banner">
                    <h2 className="cdnr-add-title">Credit/Debit Notes (Unregistered)- Add Note</h2>
                </div>

                <div className="cdnr-add-body">
                    <div className="cdnr-add-top-bar">
                        <button className="cdnr-add-back-arrow" onClick={() => navigate('/returns/gstr1/cdnur')}>
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                        <div className="mandatory-note">
                            <span className="red-dot">•</span> Indicates Mandatory Fields
                        </div>
                    </div>

                    {/* Differential Rate Checkbox */}
                    <div className="cdnr-differential-section" style={{ backgroundColor: '#f9f9f9', padding: '20px', marginBottom: '25px' }}>
                        <label className="cdnr-checkbox-item">
                            <input
                                type="checkbox"
                                name="differentialRate"
                                checked={formData.differentialRate}
                                onChange={handleFormChange}
                            />
                            Is the supply eligible to be taxed at a differential percentage (%) of the existing rate of tax, as notified by the Government?
                        </label>
                    </div>

                    {/* Main Form Fields */}
                    <div className="cdnr-add-form-grid">
                        <div className="cdnr-form-group">
                            <label>Type <span className="red-dot">*</span></label>
                            <select name="type" value={formData.type} onChange={handleFormChange}>
                                {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="cdnr-form-group">
                            <label>Debit/Credit Note No. <span className="red-dot">*</span></label>
                            <input type="text" name="noteNumber" value={formData.noteNumber} onChange={handleFormChange} />
                        </div>
                        <div className="cdnr-form-group">
                            <label>Debit/Credit Note Date <span className="red-dot">*</span></label>
                            <CustomDatePicker 
                                value={formData.noteDate} 
                                onChange={(val) => setFormData(prev => ({...prev, noteDate: val}))} 
                            />
                        </div>


                        <div className="cdnr-form-group">
                            <label>Note value (₹) <span className="red-dot">*</span></label>
                            <input type="text" name="noteValue" value={formData.noteValue} onChange={handleFormChange} style={{ textAlign: 'right' }} />
                        </div>
                        <div className="cdnr-form-group">
                            <label>Note Type <span className="red-dot">*</span></label>
                            <select name="noteType" value={formData.noteType} onChange={handleFormChange}>
                                <option value="">Select</option>
                                <option value="Credit">Credit</option>
                                <option value="Debit">Debit</option>
                            </select>
                        </div>
                        <div className="cdnr-form-group">
                            <label>POS <span style={{ fontSize: '11px', border: '1px solid #111', borderRadius: '50%', width: '13px', height: '13px', display: 'inline-block', textAlign: 'center', lineHeight: '13px', marginLeft: '4px' }}>i</span> <span className="red-dot">*</span></label>
                            <select name="pos" value={formData.pos} onChange={handleFormChange}>
                                <option value="">Select</option>
                                {posOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>

                        <div className="cdnr-form-group">
                            <label>Supply type</label>
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

                    {/* Item Details Table */}
                    <div className="cdnr-item-details-section" style={{ marginTop: '30px' }}>
                        <h3 className="tax-section-title" style={{ color: '#2b4b7c', fontSize: '16px', fontWeight: '500', marginBottom: '15px' }}>Item details</h3>

                        <div className="cdnur-tax-table-wrapper">
                            <table className="cdnur-tax-table">
                                <thead>
                                    <tr>
                                        <th rowSpan="2" style={{ width: '15%' }}>Rate (%)</th>
                                        <th rowSpan="2" style={{ width: '25%' }}>Taxable value (₹) <span className="red-dot">*</span></th>
                                        <th colSpan={formData.supplyType === 'Intra-State' ? 3 : 2}>Amount of Tax</th>
                                    </tr>
                                    <tr>
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
                                    {rates.map((rate) => (
                                        <tr key={rate}>
                                            <td className="rate-cell">{rate}</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="table-input"
                                                    value={taxData[rate].taxableValue}
                                                    onChange={(e) => handleTaxChange(rate, 'taxableValue', e.target.value)}
                                                />
                                            </td>
                                            {formData.supplyType === 'Intra-State' ? (
                                                <>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="table-input disabled-table-input"
                                                            value={taxData[rate].centralTax}
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="table-input disabled-table-input"
                                                            value={taxData[rate].stateTax}
                                                            readOnly
                                                        />
                                                    </td>
                                                </>
                                            ) : (
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="table-input disabled-table-input"
                                                        value={taxData[rate].integratedTax}
                                                        readOnly
                                                    />
                                                </td>
                                            )}
                                            <td>
                                                <input
                                                    type="text"
                                                    className="table-input"
                                                    value={taxData[rate].cess}
                                                    onChange={(e) => handleTaxChange(rate, 'cess', e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="cdnr-add-actions" style={{ marginTop: '40px' }}>
                        <button className="cdnr-btn-outline" onClick={() => navigate('/returns/gstr1/cdnur')}>BACK</button>
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

export default GSTR1CDNURAddInvoice;
