import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1ECOSupplies.css';
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import toast, { Toaster } from 'react-hot-toast';

const ECO_MASTER = {
    "27AAACS1084B1ZS": "Amazon Seller Services Pvt Ltd",
    "29AAACF4194D1Z4": "Flipkart Internet Private Limited",
    "07AAECC7173H1Z2": "Clues Network Pvt Ltd",
    "32AAACC1234A1Z1": "Kerala State E-Commerce Operator",
    "32AAAAA0000A1Z1": "Dummy Kerala Operator",
    "27AAAAA0000A1Z1": "Dummy Maharashtra Operator"
};

const getSupplyType = (operatorGstin) => {
    if (!operatorGstin || operatorGstin.length < 2 || !/^\d{2}/.test(operatorGstin)) return '';
    const operatorStateCode = operatorGstin.substring(0, 2);
    const supplierGstin = localStorage.getItem('gstin') || '32AAAAA1111A1Z1';
    const supplierStateCode = supplierGstin.substring(0, 2) || '32';
    return supplierStateCode === operatorStateCode ? 'Intra-State' : 'Inter-State';
};

const calculateTaxes = (netVal, operatorGstin) => {
    const net = parseFloat(netVal);
    if (isNaN(net) || net < 0) {
        return { integratedTax: '', centralTax: '', stateTax: '' };
    }

    const supplyType = getSupplyType(operatorGstin);
    if (supplyType === 'Inter-State') {
        // Interstate: IGST = 1%
        const igst = net * 0.01;
        return {
            integratedTax: igst.toFixed(2),
            centralTax: '',
            stateTax: ''
        };
    } else if (supplyType === 'Intra-State') {
        // Intrastate: CGST = 0.5%, SGST = 0.5%
        const half = net * 0.005;
        return {
            integratedTax: '',
            centralTax: half.toFixed(2),
            stateTax: half.toFixed(2)
        };
    }

    return { integratedTax: '', centralTax: '', stateTax: '' };
};

const formatWithCommas = (val) => {
    if (val === '' || val === undefined || val === null) return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    
    // Split into integer and fractional parts
    const parts = num.toFixed(2).split('.');
    let integerPart = parts[0];
    const fractionalPart = parts[1];
    
    // Indian numbering format (comma after 3 digits, then every 2 digits)
    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherBits = integerPart.substring(0, integerPart.length - 3);
    if (otherBits !== '') {
        lastThree = ',' + lastThree;
    }
    const formattedInteger = otherBits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    
    return formattedInteger + '.' + fractionalPart;
};

const GSTR1ECOAddRecord = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'TCS'; // TCS or PAY

    const [formData, setFormData] = useState({
        gstin: '',
        tradeName: '',
        netValue: '',
        integratedTax: '',
        centralTax: '',
        stateTax: '',
        cess: '0'
    });

    const [focusedField, setFocusedField] = useState(null);
    const [gstinError, setGstinError] = useState('');

    const handleFocus = (field) => {
        setFocusedField(field);
    };

    const handleBlur = (field) => {
        setFocusedField(null);
        setFormData(prev => {
            const val = prev[field];
            if (val === '' || val === undefined || val === null) return prev;
            const parsed = parseFloat(val);
            if (isNaN(parsed)) return prev;

            let updated = { ...prev, [field]: parsed.toFixed(2) };
            if (field === 'centralTax') {
                updated.stateTax = parsed.toFixed(2);
            }
            if (field === 'stateTax') {
                updated.centralTax = parsed.toFixed(2);
            }
            return updated;
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Restriction: Only positive numeric inputs allowed
        if (['netValue', 'integratedTax', 'centralTax', 'stateTax', 'cess'].includes(name)) {
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
        }

        setFormData(prev => {
            let updated = { ...prev, [name]: value };

            if (name === 'gstin') {
                const upperGstin = value.toUpperCase();
                updated.gstin = upperGstin;

                if (upperGstin === '') {
                    setGstinError('');
                    updated.tradeName = '';
                    updated.integratedTax = '';
                    updated.centralTax = '';
                    updated.stateTax = '';
                } else if (upperGstin.length < 15) {
                    setGstinError('GSTIN should be 15 characters long');
                    updated.tradeName = '';
                    updated.integratedTax = '';
                    updated.centralTax = '';
                    updated.stateTax = '';
                } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{3}$/i.test(upperGstin)) {
                    setGstinError('Invalid GSTIN format');
                    updated.tradeName = '';
                    updated.integratedTax = '';
                    updated.centralTax = '';
                    updated.stateTax = '';
                } else {
                    setGstinError('');
                    const trade = ECO_MASTER[upperGstin] || "E-Commerce Operator Ltd";
                    updated.tradeName = trade;
                    
                    const taxes = calculateTaxes(updated.netValue, upperGstin);
                    updated = { ...updated, ...taxes };
                }
            }

            if (name === 'netValue') {
                const netNum = parseFloat(value);
                if (value === '' || isNaN(netNum) || netNum < 0) {
                    updated.integratedTax = '';
                    updated.centralTax = '';
                    updated.stateTax = '';
                } else {
                    const taxes = calculateTaxes(value, updated.gstin);
                    updated = { ...updated, ...taxes };
                }
            }

            // Real-time synchronization CGST <-> SGST
            if (name === 'centralTax') {
                updated.stateTax = value;
            }
            if (name === 'stateTax') {
                updated.centralTax = value;
            }

            return updated;
        });
    };

    const isSaveDisabled = !formData.gstin || !!gstinError || !formData.tradeName || !formData.netValue || parseFloat(formData.netValue) < 0;

    const handleSave = async () => {
        if (isSaveDisabled) {
            toast.error('Please resolve all validation errors and fill mandatory fields');
            return;
        }

        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            const payload = {
                trn,
                eco_type: type,
                eco_gstin: formData.gstin,
                trade_name: formData.tradeName,
                net_value: parseFloat(formData.netValue) || 0,
                integrated_tax: parseFloat(formData.integratedTax) || 0,
                central_tax: parseFloat(formData.centralTax) || 0,
                state_tax: parseFloat(formData.stateTax) || 0,
                cess: parseFloat(formData.cess) || 0,
                updated_at: new Date().toISOString()
            };

            const res = await gstr1Service.saveGstr1Record('gstr1_eco_supplies', payload);

            if (res.success) {
                toast.success('Record saved successfully!');
                navigate(`/returns/gstr1/eco?type=${type}`);
            } else {
                toast.error('Failed to save record');
            }
        } catch (err) {
            toast.error('Error saving record');
        }
    };

    const title = type === 'TCS'
        ? "14 - Supplies made through E-Commerce Operators - u/s 52 (TCS) - Add Details"
        : "14 - Supplies made through E-Commerce Operators - u/s 9(5) - Add Details";

    const breadcrumbType = type === 'TCS' ? "u/s 52 (TCS)" : "u/s 9(5)";

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
                    <Link to="/returns/gstr1/eco" style={{ textDecoration: 'none', color: '#167dc2' }}>Supplies through ECO</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                    <span style={{ color: '#4b5563' }}>{breadcrumbType}</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            <div className="eco-main-content">
                <div className="eco-header-banner">
                    <div className="eco-header-flex">
                        <h2 className="eco-title">{title}</h2>
                    </div>
                </div>

                <div className="eco-body">
                    <div className="mandatory-note-row" style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <span className="red-dot">•</span> <span style={{ fontSize: '12px', color: '#333' }}>Indicates Mandatory Fields</span>
                    </div>

                    <div className="eco-form-grid">
                        <div className="eco-form-group">
                            <label>GSTIN of e-commerce operator <span className="red-dot">*</span></label>
                            <input 
                                type="text" 
                                name="gstin" 
                                placeholder="Enter GSTIN" 
                                value={formData.gstin} 
                                onChange={handleChange} 
                                style={gstinError ? { borderColor: '#d32f2f' } : {}}
                            />
                            {gstinError && (
                                <span style={{ color: '#d32f2f', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                                    {gstinError}
                                </span>
                            )}
                        </div>
                        <div className="eco-form-group">
                            <label>Trade/Legal Name <span className="red-dot">*</span></label>
                            <input 
                                type="text" 
                                name="tradeName" 
                                className="disabled-input" 
                                value={formData.tradeName} 
                                readOnly={true} 
                            />
                        </div>
                        <div className="eco-form-group">
                            <label>Net value of supplies (₹) <span className="red-dot">*</span></label>
                            <input 
                                type="text" 
                                name="netValue" 
                                placeholder="0.00"
                                value={focusedField === 'netValue' ? formData.netValue : formatWithCommas(formData.netValue)} 
                                onChange={handleChange} 
                                onFocus={() => handleFocus('netValue')}
                                onBlur={() => handleBlur('netValue')}
                            />
                        </div>

                        <div className="eco-form-group">
                            <label>Integrated tax (₹) <span className="red-dot">*</span></label>
                            <input 
                                type="text" 
                                name="integratedTax" 
                                placeholder="0.00"
                                value={focusedField === 'integratedTax' ? formData.integratedTax : formatWithCommas(formData.integratedTax)} 
                                onChange={handleChange}
                                onFocus={() => handleFocus('integratedTax')}
                                onBlur={() => handleBlur('integratedTax')}
                            />
                        </div>

                        <div className="eco-form-group">
                            <label>Central tax (₹) <span className="red-dot">*</span></label>
                            <input 
                                type="text" 
                                name="centralTax" 
                                placeholder="0.00"
                                value={focusedField === 'centralTax' ? formData.centralTax : formatWithCommas(formData.centralTax)} 
                                onChange={handleChange}
                                onFocus={() => handleFocus('centralTax')}
                                onBlur={() => handleBlur('centralTax')}
                            />
                        </div>
                        
                        <div className="eco-form-group">
                            <label>State/UT tax (₹) <span className="red-dot">*</span></label>
                            <input 
                                type="text" 
                                name="stateTax" 
                                placeholder="0.00"
                                value={focusedField === 'stateTax' ? formData.stateTax : formatWithCommas(formData.stateTax)} 
                                onChange={handleChange}
                                onFocus={() => handleFocus('stateTax')}
                                onBlur={() => handleBlur('stateTax')}
                            />
                        </div>

                        <div className="eco-form-group">
                            <label>Cess (₹)</label>
                            <input 
                                type="text" 
                                name="cess" 
                                placeholder="0.00"
                                value={focusedField === 'cess' ? formData.cess : formatWithCommas(formData.cess)} 
                                onChange={handleChange} 
                                onFocus={() => handleFocus('cess')}
                                onBlur={() => handleBlur('cess')}
                            />
                        </div>
                    </div>

                    <div className="eco-action-row" style={{ justifyContent: 'flex-end', gap: '15px', marginTop: '40px' }}>
                        <button className="eco-btn-outline" style={{ padding: '8px 40px' }} onClick={() => navigate(`/returns/gstr1/eco?type=${type}`)}>BACK</button>
                        <button 
                            className={isSaveDisabled ? "eco-btn-disabled" : "eco-btn-primary"} 
                            style={{ 
                                padding: '8px 40px', 
                                backgroundColor: isSaveDisabled ? '#cccccc' : '#2b4b7c',
                                cursor: isSaveDisabled ? 'not-allowed' : 'pointer'
                            }} 
                            onClick={handleSave}
                            disabled={isSaveDisabled}
                        >
                            SAVE
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

export default GSTR1ECOAddRecord;
