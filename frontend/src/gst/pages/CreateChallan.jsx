import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './CreateChallan.css';

// Simple Indian Numbering System to words converter
const numberToWords = (num) => {
    if (num === 0) return 'Zero Only';
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

    const numStr = num.toString();
    if (numStr.length > 9) return 'Amount Too Large';
    
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';
    
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';
    
    return str.trim();
};

const CreateChallan = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [reasonText, setReasonText] = useState('Any other payment');
    const [paymentMode, setPaymentMode] = useState('');

    useEffect(() => {
        if (location.state && location.state.reasonText) {
            setReasonText(location.state.reasonText);
        }
    }, [location]);

    const [rows, setRows] = useState({
        cgst: { tax: '', interest: '', penalty: '', fees: '', other: '' },
        igst: { tax: '', interest: '', penalty: '', fees: '', other: '' },
        cess: { tax: '', interest: '', penalty: '', fees: '', other: '' },
        sgst: { tax: '', interest: '', penalty: '', fees: '', other: '' },
    });

    const handleInputChange = (rowKey, colKey, value) => {
        if (value && !/^\d+$/.test(value)) return;
        setRows(prev => ({
            ...prev,
            [rowKey]: {
                ...prev[rowKey],
                [colKey]: value
            }
        }));
    };

    const getRowTotal = (rowKey) => {
        const r = rows[rowKey];
        return (Number(r.tax) || 0) + (Number(r.interest) || 0) + (Number(r.penalty) || 0) + (Number(r.fees) || 0) + (Number(r.other) || 0);
    };

    const grandTotal = ['cgst', 'igst', 'cess', 'sgst'].reduce((sum, key) => sum + getRowTotal(key), 0);

    const handleEditReason = () => {
        navigate('/payment/reason-for-challan');
    };

    const handleGenerate = () => {
        // Mock generation logic
        navigate('/payment/create-challan');
    };

    const rowConfigs = [
        { key: 'cgst', label: 'CGST(0005)' },
        { key: 'igst', label: 'IGST(0008)' },
        { key: 'cess', label: 'CESS(0009)' },
        { key: 'sgst', label: 'Kerala SGST(0006)' },
    ];

    const colConfigs = [
        { key: 'tax', label: 'Tax (₹)' },
        { key: 'interest', label: 'Interest (₹)' },
        { key: 'penalty', label: 'Penalty (₹)' },
        { key: 'fees', label: 'Fees (₹)' },
        { key: 'other', label: 'Other (₹)' },
    ];

    return (
        <div className="cc-container">
            {/* Breadcrumb Bar */}
            <div className="cc-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <span>Payment</span>
                <span>&gt;</span>
                <span>Create Challan</span>
            </div>

            <div className="cc-content-box">
                {/* Tabs */}
                <div className="cc-tabs-container">
                    <div className="cc-tab active">Create Challan</div>
                    <div className="cc-tab" onClick={() => navigate('/payment/saved-challan')}>Saved Challan</div>
                    <div className="cc-tab" onClick={() => navigate('/payment/challan-history')}>Challan History</div>
                </div>

                {/* Reason For Challan Section */}
                <div className="cc-section-title">
                    <span>Reason For Challan</span>
                    <span className="cc-edit-reason" onClick={handleEditReason}>Edit Reason</span>
                </div>

                <div className="cc-reason-box">
                    <div className="cc-reason-box-title">Reason</div>
                    <div className="cc-reason-box-value">{reasonText}</div>
                </div>

                {/* Details of Deposit Section */}
                <div className="cc-section-title">
                    <span>Details of Deposit</span>
                </div>

                <table className="cc-table">
                    <thead>
                        <tr>
                            <th></th>
                            {colConfigs.map(c => <th key={c.key}>{c.label}</th>)}
                            <th>Total (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rowConfigs.map(row => (
                            <tr key={row.key}>
                                <td className="row-label">{row.label}</td>
                                {colConfigs.map(col => (
                                    <td key={col.key}>
                                        <input
                                            type="text"
                                            className="cc-input"
                                            value={rows[row.key][col.key]}
                                            onChange={(e) => handleInputChange(row.key, col.key, e.target.value)}
                                        />
                                    </td>
                                ))}
                                <td>
                                    <input
                                        type="text"
                                        className="cc-input cc-input-disabled"
                                        value={getRowTotal(row.key)}
                                        disabled
                                        readOnly
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="cc-grand-total">
                    Total Challan Amount: <span>₹ {grandTotal}</span>
                </div>
                
                <div className="cc-amount-words">
                    Total Challan Amount (In Words): <span>{numberToWords(grandTotal)}</span>
                </div>

                {/* Payment Modes Section */}
                <div className="cc-payment-modes">
                    <div className="cc-payment-modes-title">
                        Payment Modes <span className="red-asterisk">*</span>
                    </div>
                    <div className="cc-pm-grid">
                        <div 
                            className={`cc-pm-option ${paymentMode === 'e-payment' ? 'active' : ''}`}
                            onClick={() => setPaymentMode('e-payment')}
                        >
                            <input type="radio" checked={paymentMode === 'e-payment'} readOnly style={{marginRight: '5px'}}/>
                            💳 E-Payment
                        </div>
                        <div 
                            className={`cc-pm-option ${paymentMode === 'otc' ? 'active' : ''}`}
                            onClick={() => setPaymentMode('otc')}
                        >
                            <input type="radio" checked={paymentMode === 'otc'} readOnly style={{marginRight: '5px'}}/>
                            💵 Over The Counter
                        </div>
                        <div 
                            className={`cc-pm-option ${paymentMode === 'neft' ? 'active' : ''}`}
                            onClick={() => setPaymentMode('neft')}
                        >
                            <input type="radio" checked={paymentMode === 'neft'} readOnly style={{marginRight: '5px'}}/>
                            🏦 NEFT/RTGS
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="cc-actions">
                    <button className="cc-btn cc-btn-primary" onClick={handleEditReason}>EDIT REASON</button>
                    <button className="cc-btn cc-btn-secondary" disabled={grandTotal <= 0}>SAVE</button>
                    <button className="cc-btn cc-btn-primary" disabled={grandTotal <= 0 || !paymentMode} onClick={handleGenerate}>GENERATE CHALLAN</button>
                </div>
            </div>
        </div>
    );
};

export default CreateChallan;
