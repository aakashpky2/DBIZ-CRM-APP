import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1Supplies95Dashboard.css';
import './GSTR1B2BAddInvoice.css';
import api from '../api/axios';
import gstr1Service from '../services/gstr1Service';
import toast, { Toaster } from 'react-hot-toast';
import CustomDatePicker from '../components/CustomDatePicker';

const posOptions = [
    "35-Andaman and Nicobar Islands",
    "37-Andhra Pradesh",
    "12-Arunachal Pradesh",
    "18-Assam",
    "10-Bihar",
    "04-Chandigarh",
    "22-Chhattisgarh",
    "26-Dadra and Nagar Haveli and Daman and Diu",
    "25-Daman and Diu",
    "07-Delhi",
    "96-Foreign Country",
    "30-Goa",
    "24-Gujarat",
    "06-Haryana",
    "02-Himachal Pradesh",
    "01-Jammu and Kashmir",
    "20-Jharkhand",
    "29-Karnataka",
    "32-Kerala",
    "38-Ladakh",
    "31-Lakshadweep",
    "23-Madhya Pradesh",
    "27-Maharashtra",
    "14-Manipur",
    "17-Meghalaya",
    "15-Mizoram",
    "13-Nagaland",
    "21-Odisha",
    "97-Other Territory",
    "34-Puducherry",
    "03-Punjab",
    "08-Rajasthan",
    "11-Sikkim",
    "33-Tamil Nadu",
    "36-Telangana",
    "16-Tripura",
    "09-Uttar Pradesh",
    "05-Uttarakhand",
    "19-West Bengal"
];

const stateCodeMap = {
    "01": "01-Jammu and Kashmir",
    "02": "02-Himachal Pradesh",
    "03": "03-Punjab",
    "04": "04-Chandigarh",
    "05": "05-Uttarakhand",
    "06": "06-Haryana",
    "07": "07-Delhi",
    "08": "08-Rajasthan",
    "09": "09-Uttar Pradesh",
    "10": "10-Bihar",
    "11": "11-Sikkim",
    "12": "12-Arunachal Pradesh",
    "13": "13-Nagaland",
    "14": "14-Manipur",
    "15": "15-Mizoram",
    "16": "16-Tripura",
    "17": "17-Meghalaya",
    "18": "18-Assam",
    "19": "19-West Bengal",
    "20": "20-Jharkhand",
    "21": "21-Odisha",
    "22": "22-Chhattisgarh",
    "23": "23-Madhya Pradesh",
    "24": "24-Gujarat",
    "25": "25-Daman and Diu",
    "26": "26-Dadra and Nagar Haveli and Daman and Diu",
    "27": "27-Maharashtra",
    "29": "29-Karnataka",
    "30": "30-Goa",
    "31": "31-Lakshadweep",
    "32": "32-Kerala",
    "33": "33-Tamil Nadu",
    "36": "36-Telangana",
    "37": "37-Andhra Pradesh",
    "38": "38-Ladakh",
    "97": "97-Other Territory",
    "96": "96-Foreign Country"
};

const calculateSupplyType = (supplierGstin, recipientGstin, pos) => {
    if (!pos) return '';
    const posCode = pos.substring(0, 2);
    // If POS is Kerala (32), it is Intra-State (CGST/SGST). Otherwise, it is Inter-State (IGST).
    return (posCode === '32' || pos.toLowerCase().includes('kerala')) ? 'Intra-State' : 'Inter-State';
};

const calculateB2CTaxes = (taxableVal, rateVal, supplyType) => {
    const amt = parseFloat(taxableVal);
    const rt = parseFloat(String(rateVal).replace('%', ''));
    
    if (isNaN(amt) || isNaN(rt)) {
        return { integratedTax: '', centralTax: '', stateTax: '' };
    }

    if (supplyType === 'Intra-State') {
        const half = (amt * (rt / 2)) / 100;
        return {
            integratedTax: '',
            centralTax: half.toFixed(2),
            stateTax: half.toFixed(2)
        };
    } else {
        const igst = (amt * rt) / 100;
        return {
            integratedTax: igst.toFixed(2),
            centralTax: '',
            stateTax: ''
        };
    }
};

const GSTR1Supplies95AddDetails = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'R2R'; // R2R, R2NR, NR2R, NR2NR

    // Is B2B if tab is R2R or NR2R. B2C if tab is R2NR or NR2NR
    const getVariantInfo = () => {
        switch (tab) {
            case 'R2R': return { suffix: 'B2B', title: 'B2B', isB2B: true, hasSupplierGstin: true };
            case 'NR2R': return { suffix: 'URP2B', title: 'URP2B', isB2B: true, hasSupplierGstin: false };
            case 'R2NR': return { suffix: 'B2C', title: 'B2C', isB2B: false, hasSupplierGstin: true };
            case 'NR2NR': return { suffix: 'URP2C', title: 'URP2C', isB2B: false, hasSupplierGstin: false };
            default: return { suffix: 'B2B', title: 'B2B', isB2B: true, hasSupplierGstin: true };
        }
    };

    const variant = getVariantInfo();
    const isB2B = variant.isB2B;

    const [isPosOpen, setIsPosOpen] = useState(false);

    // Close dropdown on click outside
    React.useEffect(() => {
        const handleOutsideClick = (e) => {
            if (!e.target.closest('.gst-custom-select-wrapper')) {
                setIsPosOpen(false);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

    // Reset form state when tab changes
    React.useEffect(() => {
        setFormData({
            supplierGstin: '',
            supplierName: '',
            pos: '',
            supplyType: '',
            taxableValue: '',
            rate: '',
            integratedTax: '',
            centralTax: '',
            stateTax: '',
            cess: '',
            recipientGstin: '',
            recipientName: '',
            documentNumber: '',
            documentDate: '',
            totalValue: '',
            deemedExports: false,
            sezWithPayment: false,
            sezWithoutPayment: false,
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
    }, [tab]);

    const [formData, setFormData] = useState({
        // Generic Fields
        supplierGstin: '',
        supplierName: '',
        pos: '',
        supplyType: '',
        taxableValue: '',
        rate: '',
        integratedTax: '',
        centralTax: '',
        stateTax: '',
        cess: '',

        // B2B specific
        recipientGstin: '',
        recipientName: '',
        documentNumber: '',
        documentDate: '',
        totalValue: '',
        deemedExports: false,
        sezWithPayment: false,
        sezWithoutPayment: false,

        // POS-based Tax table details
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Accept only numeric input values for taxableValue and cess in B2C
        if (name === 'taxableValue' || name === 'cess') {
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
        }

        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Auto-detect names if GSTIN is typed (mockup lookup)
            if (name === 'supplierGstin') {
                const cleanVal = value.toUpperCase();
                updated.supplierGstin = cleanVal;
                if (cleanVal.length >= 15) {
                    updated.supplierName = `Supplier (${cleanVal.substring(2, 7)}) Pvt Ltd`;
                } else if (cleanVal.length === 0) {
                    updated.supplierName = '';
                }
                
                // Auto-set POS if we can extract it from GSTIN (if user hasn't selected POS yet)
                const code = cleanVal.substring(0, 2);
                if (/^\d{2}$/.test(code) && stateCodeMap[code] && !updated.pos) {
                    updated.pos = stateCodeMap[code];
                }
            }

            if (name === 'recipientGstin') {
                const cleanVal = value.toUpperCase();
                updated.recipientGstin = cleanVal;
                if (cleanVal.length >= 15) {
                    updated.recipientName = `Recipient (${cleanVal.substring(2, 7)}) Corp`;
                } else if (cleanVal.length === 0) {
                    updated.recipientName = '';
                }
                
                // Auto-set POS if no POS is selected and no Supplier GSTIN is entered
                const code = cleanVal.substring(0, 2);
                if (/^\d{2}$/.test(code) && stateCodeMap[code] && !updated.pos && !updated.supplierGstin) {
                    updated.pos = stateCodeMap[code];
                }
            }

            // Recalculate Supply Type
            const oldSupplyType = prev.supplyType;
            updated.supplyType = calculateSupplyType(updated.supplierGstin, updated.recipientGstin, updated.pos);

            // Clear old tax values and fields when switching POS / supplyType
            if (name === 'pos' || updated.supplyType !== oldSupplyType) {
                // Clear B2C single fields
                updated.taxableValue = '';
                updated.rate = '';
                updated.integratedTax = '';
                updated.centralTax = '';
                updated.stateTax = '';
                updated.cess = '';

                // Clear B2B table fields
                updated.itemDetails = prev.itemDetails.map(item => ({
                    ...item,
                    taxableValue: '',
                    integratedTax: '',
                    centralTax: '',
                    stateTax: '',
                    cess: ''
                }));
            }

            // Recalculate B2C single rate taxes immediately
            if (name === 'taxableValue' || name === 'rate' || name === 'pos') {
                const b2cTaxes = calculateB2CTaxes(updated.taxableValue, updated.rate, updated.supplyType);
                updated.integratedTax = b2cTaxes.integratedTax;
                updated.centralTax = b2cTaxes.centralTax;
                updated.stateTax = b2cTaxes.stateTax;
            }

            return updated;
        });
    };

    const handleItemChange = (index, field, value) => {
        // Accept only numeric input values for taxableValue, taxes and cess
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
            const rateStr = newItemDetails[index].rate; // e.g. "18%"
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

    const calculateTotals = () => {
        return formData.itemDetails.reduce((acc, item) => {
            acc.taxableValue += parseFloat(item.taxableValue || 0);
            acc.integratedTax += parseFloat(item.integratedTax || 0);
            acc.centralTax += parseFloat(item.centralTax || 0);
            acc.stateTax += parseFloat(item.stateTax || 0);
            acc.cess += parseFloat(item.cess || 0);
            return acc;
        }, { taxableValue: 0, integratedTax: 0, centralTax: 0, stateTax: 0, cess: 0 });
    };

    const totals = calculateTotals();

    const handleSave = async () => {
        // Validation logic
        if (isB2B) {
            if ((variant.hasSupplierGstin && !formData.supplierGstin) || !formData.recipientGstin || !formData.documentNumber || !formData.documentDate || !formData.totalValue || !formData.pos) {
                toast.error('Please fill mandatory fields');
                return;
            }
            
            // Verify at least one row in the table has a taxableValue
            const hasTaxableValue = formData.itemDetails.some(item => parseFloat(item.taxableValue) > 0);
            if (!hasTaxableValue) {
                toast.error('Please enter taxable value for at least one rate row');
                return;
            }
        } else {
            if ((variant.hasSupplierGstin && !formData.supplierGstin) || !formData.pos || !formData.taxableValue || !formData.rate) {
                toast.error('Please fill mandatory fields');
                return;
            }
        }

        try {
            const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

            let payload = {
                trn,
                tab_type: tab,
                document_number: formData.documentNumber || '',
                document_date: formData.documentDate || '',
                pos: formData.pos,
                taxable_value: formData.taxableValue || 0,
                rate: formData.rate || '',
                supply_type: formData.supplyType,
                supplier_gstin: formData.supplierGstin || '',
                supplier_name: formData.supplierName || '',
                recipient_gstin: formData.recipientGstin || '',
                recipient_name: formData.recipientName || ''
            };

            if (isB2B) {
                payload.item_details = formData.itemDetails.filter(item => parseFloat(item.taxableValue) > 0);
            } else {
                payload.item_details = {
                    integratedTax: formData.integratedTax,
                    centralTax: formData.centralTax,
                    stateTax: formData.stateTax,
                    cess: formData.cess
                };
            }

            const res = await gstr1Service.saveGstr1Record('gstr1_sup95', payload);

            if (res.success) {
                toast.success('Supplies record saved successfully!');
                navigate(`/returns/gstr1/sup95?tab=${tab}`);
            } else {
                toast.error('Failed to save record');
            }
        } catch (error) {
            toast.error('Error saving: ' + error.message);
        }
    };

    const rates = ["0%", "0.1%", "0.25%", "1%", "1.5%", "3%", "5%", "6%", "7.5%", "12%", "18%", "28%", "40%"];

    const headerTitle = `15 - Supplies U/s 9(5) - ${variant.title} - Add Details`;

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6' }}>
            <Toaster position="top-right" />
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                    <span className="breadcrumb-sep">&gt;</span>
                    <Link to="/returns-dashboard" className="breadcrumb-link">Returns</Link>
                    <span className="breadcrumb-sep">&gt;</span>
                    <Link to="/returns/gstr1" className="breadcrumb-link">GSTR-1/IFF</Link>
                    <span className="breadcrumb-sep">&gt;</span>
                    <Link to="/returns/gstr1/sup95" className="breadcrumb-link">Supplies U/s 9(5)</Link>
                    <span className="breadcrumb-sep">&gt;</span>
                    <span className="breadcrumb-current">{variant.suffix}</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            <div className="sup95-main-content">
                <div className="sup95-header-banner">
                    <div className="sup95-header-flex">
                        <h2 className="sup95-title">{headerTitle}</h2>
                    </div>
                </div>

                <div className="sup95-body">
                    <div className="sup95-back-nav" onClick={() => navigate(`/returns/gstr1/sup95?tab=${tab}`)}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="white" style={{ background: '#1eb3a6', borderRadius: '50%', padding: '4px' }}>
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                    </div>

                    <div className="mandatory-note-row" style={{ textAlign: 'right', marginBottom: '10px' }}>
                        <span className="red-dot">•</span> <span style={{ fontSize: '12px', color: '#333' }}>Indicates Mandatory Fields</span>
                    </div>

                    {isB2B && (
                        <div className="sup95-checkbox-row">
                            <label><input type="checkbox" name="deemedExports" checked={formData.deemedExports} onChange={handleChange} /> Deemed Exports</label>
                            <label><input type="checkbox" name="sezWithPayment" checked={formData.sezWithPayment} onChange={handleChange} /> SEZ Supplies with payment</label>
                            <label><input type="checkbox" name="sezWithoutPayment" checked={formData.sezWithoutPayment} onChange={handleChange} /> SEZ Supplies without payment</label>
                        </div>
                    )}

                    <div className="sup95-form-grid">
                        {variant.hasSupplierGstin && (
                            <>
                                <div className="sup95-form-group">
                                    <label>Supplier GSTIN/UIN <span className="red-dot">*</span></label>
                                    <input type="text" name="supplierGstin" placeholder="Enter Supplier GSTIN/UIN" value={formData.supplierGstin} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>Supplier Name <span className="red-dot">*</span></label>
                                    <input type="text" name="supplierName" className="disabled-input" value={formData.supplierName} onChange={handleChange} />
                                </div>
                            </>
                        )}

                        {isB2B ? (
                            <>
                                <div className="sup95-form-group">
                                    <label>Recipient GSTIN/UIN <span className="red-dot">*</span></label>
                                    <input type="text" name="recipientGstin" placeholder="Enter Recipient GSTIN/UIN" value={formData.recipientGstin} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>Recipient name <span className="red-dot">*</span></label>
                                    <input type="text" name="recipientName" className="disabled-input" value={formData.recipientName} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>Document number <span className="red-dot">*</span></label>
                                    <input type="text" name="documentNumber" value={formData.documentNumber} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>Document date <span className="red-dot">*</span></label>
                                    <div className="date-input-wrapper">
                                        <CustomDatePicker 
                                            value={formData.documentDate} 
                                            onChange={(val) => setFormData(prev => ({...prev, documentDate: val}))} 
                                        />
                                    </div>
                                </div>
                                <div className="sup95-form-group">
                                    <label>Total value of supplies made (₹) <span className="red-dot">*</span></label>
                                    <input type="text" name="totalValue" value={formData.totalValue} onChange={handleChange} />
                                </div>
                                <div className="sup95-form-group">
                                    <label>POS <span style={{ fontSize: '12px', background: '#ccc', borderRadius: '50%', padding: '0 3px', marginLeft: '5px' }}>i</span> <span className="red-dot">*</span></label>
                                    <div className="gst-custom-select-wrapper">
                                        <div 
                                            className={`gst-custom-select-trigger ${isPosOpen ? 'open' : ''}`} 
                                            onClick={() => setIsPosOpen(!isPosOpen)}
                                        >
                                            <span>{formData.pos || 'Select'}</span>
                                            <span className="gst-custom-select-arrow"></span>
                                        </div>
                                        {isPosOpen && (
                                            <div className="gst-custom-select-dropdown">
                                                <div 
                                                    className={`gst-custom-select-option ${formData.pos === '' ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        handleChange({ target: { name: 'pos', value: '' } });
                                                        setIsPosOpen(false);
                                                    }}
                                                >
                                                    Select
                                                </div>
                                                {posOptions.map(opt => (
                                                    <div 
                                                        key={opt}
                                                        className={`gst-custom-select-option ${formData.pos === opt ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            handleChange({ target: { name: 'pos', value: opt } });
                                                            setIsPosOpen(false);
                                                        }}
                                                    >
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="sup95-form-group" style={{ gridColumn: 'span 3' }}>
                                    <label>Supply type</label>
                                    <input type="text" name="supplyType" className="disabled-input" value={formData.supplyType} onChange={handleChange} style={{ width: '31.5%' }} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="sup95-form-group">
                                    <label>POS <span style={{ fontSize: '12px', background: '#ccc', borderRadius: '50%', padding: '0 3px', marginLeft: '5px' }}>i</span> <span className="red-dot">*</span></label>
                                    <div className="gst-custom-select-wrapper">
                                        <div 
                                            className={`gst-custom-select-trigger ${isPosOpen ? 'open' : ''}`} 
                                            onClick={() => setIsPosOpen(!isPosOpen)}
                                        >
                                            <span>{formData.pos || 'Select'}</span>
                                            <span className="gst-custom-select-arrow"></span>
                                        </div>
                                        {isPosOpen && (
                                            <div className="gst-custom-select-dropdown">
                                                <div 
                                                    className={`gst-custom-select-option ${formData.pos === '' ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        handleChange({ target: { name: 'pos', value: '' } });
                                                        setIsPosOpen(false);
                                                    }}
                                                >
                                                    Select
                                                </div>
                                                {posOptions.map(opt => (
                                                    <div 
                                                        key={opt}
                                                        className={`gst-custom-select-option ${formData.pos === opt ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            handleChange({ target: { name: 'pos', value: opt } });
                                                            setIsPosOpen(false);
                                                        }}
                                                    >
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="sup95-form-group">
                                    <label>Taxable value (₹) <span className="red-dot">*</span></label>
                                    <input 
                                        type="text" 
                                        name="taxableValue" 
                                        value={formData.taxableValue} 
                                        onChange={handleChange} 
                                        placeholder="0.00" 
                                        style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '10px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div className="sup95-form-group">
                                    <label>Supply type</label>
                                    <input 
                                        type="text" 
                                        name="supplyType" 
                                        className="disabled-input" 
                                        value={formData.supplyType} 
                                        readOnly 
                                        style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '10px', fontSize: '14px', backgroundColor: '#eaebed', cursor: 'not-allowed', color: '#6c757d', width: '100%', boxSizing: 'border-box' }} 
                                    />
                                </div>

                                <div className="sup95-form-group">
                                    <label>Rate <span className="red-dot">*</span></label>
                                    <select 
                                        name="rate" 
                                        value={formData.rate} 
                                        onChange={handleChange}
                                        style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '10px', fontSize: '14px', width: '100%', boxSizing: 'border-box', height: '43px', backgroundColor: '#fff' }}
                                    >
                                        <option value="">Select</option>
                                        {rates.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                {/* Dynamic Calculated Tax Fields */}
                                {formData.pos && (
                                    formData.supplyType === 'Intra-State' ? (
                                        <>
                                            <div className="sup95-form-group">
                                                <label>Central Tax (₹)</label>
                                                <input 
                                                    type="text" 
                                                    name="centralTax" 
                                                    className="disabled-input" 
                                                    value={formData.centralTax} 
                                                    readOnly 
                                                    style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '10px', fontSize: '14px', backgroundColor: '#eaebed', cursor: 'not-allowed', color: '#6c757d', width: '100%', boxSizing: 'border-box' }} 
                                                />
                                            </div>
                                            <div className="sup95-form-group">
                                                <label>State/UT Tax (₹)</label>
                                                <input 
                                                    type="text" 
                                                    name="stateTax" 
                                                    className="disabled-input" 
                                                    value={formData.stateTax} 
                                                    readOnly 
                                                    style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '10px', fontSize: '14px', backgroundColor: '#eaebed', cursor: 'not-allowed', color: '#6c757d', width: '100%', boxSizing: 'border-box' }} 
                                                />
                                            </div>
                                            <div className="sup95-form-group">
                                                <label>Cess (₹)</label>
                                                <input 
                                                    type="text" 
                                                    name="cess" 
                                                    value={formData.cess} 
                                                    onChange={handleChange} 
                                                    placeholder="0.00" 
                                                    style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '10px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} 
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="sup95-form-group">
                                                <label>Integrated Tax (₹)</label>
                                                <input 
                                                    type="text" 
                                                    name="integratedTax" 
                                                    className="disabled-input" 
                                                    value={formData.integratedTax} 
                                                    readOnly 
                                                    style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '10px', fontSize: '14px', backgroundColor: '#eaebed', cursor: 'not-allowed', color: '#6c757d', width: '100%', boxSizing: 'border-box' }} 
                                                />
                                            </div>
                                            <div className="sup95-form-group">
                                                <label>Cess (₹)</label>
                                                <input 
                                                    type="text" 
                                                    name="cess" 
                                                    value={formData.cess} 
                                                    onChange={handleChange} 
                                                    placeholder="0.00" 
                                                    style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '10px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} 
                                                />
                                            </div>
                                        </>
                                    )
                                )}
                            </>
                        )}
                    </div>

                    {isB2B && (
                        <div className="invoice-item-details-section">
                            <h3 className="section-title">Item details</h3>
                            <div className="invoice-table-container">
                                <table className="invoice-item-table">
                                    <thead>
                                        <tr>
                                            <th rowSpan="2" style={{ width: '15%', textAlign: 'center', verticalAlign: 'middle' }}>Rate (%)</th>
                                            <th rowSpan="2" style={{ width: '25%', textAlign: 'center', verticalAlign: 'middle' }}>Taxable value (₹) <span className="red-dot">*</span></th>
                                            <th colSpan={formData.supplyType === 'Intra-State' ? 3 : 2} style={{ textAlign: 'center', verticalAlign: 'middle' }}>Amount of Tax</th>
                                        </tr>
                                        <tr>
                                            {formData.supplyType === 'Intra-State' ? (
                                                <>
                                                    <th style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle' }}>Central tax (₹) <span className="red-dot">*</span></th>
                                                    <th style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle' }}>State/UT tax (₹) <span className="red-dot">*</span></th>
                                                </>
                                            ) : (
                                                <th style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle' }}>Integrated tax (₹) <span className="red-dot">*</span></th>
                                            )}
                                            <th style={{ width: '20%', textAlign: 'center', verticalAlign: 'middle' }}>Cess (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.itemDetails.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td className="rate-cell" style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>{item.rate}</td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.taxableValue}
                                                            onChange={(e) => handleItemChange(index, 'taxableValue', e.target.value)}
                                                            placeholder="0.00"
                                                            style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
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
                                                                    style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    value={item.stateTax}
                                                                    onChange={(e) => handleItemChange(index, 'stateTax', e.target.value)}
                                                                    placeholder="0.00"
                                                                    style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                                                                />
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={item.integratedTax}
                                                                readOnly
                                                                disabled={true}
                                                                className="disabled-input"
                                                                placeholder="0.00"
                                                                style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', backgroundColor: '#eaebed', cursor: 'not-allowed', color: '#6c757d', width: '100%', boxSizing: 'border-box' }}
                                                            />
                                                        </td>
                                                    )}
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.cess}
                                                            onChange={(e) => handleItemChange(index, 'cess', e.target.value)}
                                                            placeholder="0.00"
                                                            style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', width: '100%', boxSizing: 'border-box' }}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {/* Total Row */}
                                        <tr className="total-row" style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                                            <td className="rate-cell" style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }}>Total</td>
                                            <td>
                                                <input type="text" value={totals.taxableValue.toFixed(2)} readOnly className="disabled-input" style={{ fontWeight: 'bold', border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', backgroundColor: '#eaebed', cursor: 'not-allowed', color: '#6c757d', width: '100%', boxSizing: 'border-box' }} />
                                            </td>
                                            {formData.supplyType === 'Intra-State' ? (
                                                <>
                                                    <td>
                                                        <input type="text" value={totals.centralTax.toFixed(2)} readOnly className="disabled-input" style={{ fontWeight: 'bold', border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', backgroundColor: '#eaebed', cursor: 'not-allowed', color: '#6c757d', width: '100%', boxSizing: 'border-box' }} />
                                                    </td>
                                                    <td>
                                                        <input type="text" value={totals.stateTax.toFixed(2)} readOnly className="disabled-input" style={{ fontWeight: 'bold', border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', backgroundColor: '#eaebed', cursor: 'not-allowed', color: '#6c757d', width: '100%', boxSizing: 'border-box' }} />
                                                    </td>
                                                </>
                                            ) : (
                                                <td>
                                                    <input type="text" value={totals.integratedTax.toFixed(2)} readOnly className="disabled-input" style={{ fontWeight: 'bold', border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', backgroundColor: '#eaebed', cursor: 'not-allowed', color: '#6c757d', width: '100%', boxSizing: 'border-box' }} />
                                                </td>
                                            )}
                                            <td>
                                                <input type="text" value={totals.cess.toFixed(2)} readOnly className="disabled-input" style={{ fontWeight: 'bold', border: '1px solid #ced4da', borderRadius: '4px', padding: '8px', backgroundColor: '#eaebed', cursor: 'not-allowed', color: '#6c757d', width: '100%', boxSizing: 'border-box' }} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="sup95-footer-actions" style={{ justifyContent: 'flex-end', gap: '15px', marginTop: '40px' }}>
                        <button className="sup95-btn-back" style={{ padding: '8px 40px' }} onClick={() => navigate(`/returns/gstr1/sup95?tab=${tab}`)}>BACK</button>
                        <button className="sup95-btn-add" style={{ padding: '8px 40px', backgroundColor: '#2b4b7c' }} onClick={handleSave}>SAVE</button>
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

export default GSTR1Supplies95AddDetails;
