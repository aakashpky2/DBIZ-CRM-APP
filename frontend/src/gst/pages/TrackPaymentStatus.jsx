import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const TrackPaymentStatus = () => {
    const [gstin, setGstin] = useState('');
    const [cpin, setCpin] = useState('');
    const [errors, setErrors] = useState({});
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTrackStatus = async (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        if (!gstin.trim()) newErrors.gstin = 'GSTIN/Other Id is mandatory.';
        if (!cpin.trim()) newErrors.cpin = 'CPIN is mandatory.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setSearchError('');
        setPaymentDetails(null);
        setLoading(true);

        try {
            const response = await api.post('/payments/track-status', { gstin, cpin });
            const data = response.data;

            if (data.success && data.data) {
                setPaymentDetails(data.data);
            } else {
                setSearchError(data.error || 'No payment record found for the entered GSTIN and CPIN.');
            }
        } catch (err) {
            setSearchError('Error tracking payment status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (hasError) => ({
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        border: `1px solid ${hasError ? '#d32f2f' : '#ccc'}`,
        borderRadius: '4px',
        outline: 'none',
        boxSizing: 'border-box'
    });

    const labelStyle = { display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' };

    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 120px', minHeight: 'calc(100vh - 200px)' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Payment</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Track Payment Status</span>
            </div>

            {/* Main Content Box */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', margin: '0 0 20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    Track Payment Status
                </h2>

                <form onSubmit={handleTrackStatus}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                        <div>
                            <label style={labelStyle}>GSTIN/Other Id <span style={{ color: '#d32f2f' }}>*</span></label>
                            <input 
                                type="text"
                                value={gstin}
                                onChange={(e) => {
                                    setGstin(e.target.value);
                                    if (e.target.value.trim()) setErrors({ ...errors, gstin: '' });
                                }}
                                placeholder="Enter GSTIN/Other Id"
                                style={{...inputStyle(errors.gstin), textTransform: 'uppercase'}}
                            />
                            {errors.gstin && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px' }}>{errors.gstin}</div>}
                        </div>
                        <div>
                            <label style={labelStyle}>CPIN <span style={{ color: '#d32f2f' }}>*</span></label>
                            <input 
                                type="text"
                                value={cpin}
                                onChange={(e) => {
                                    setCpin(e.target.value);
                                    if (e.target.value.trim()) setErrors({ ...errors, cpin: '' });
                                }}
                                placeholder="Enter CPIN"
                                style={inputStyle(errors.cpin)}
                            />
                            {errors.cpin && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px' }}>{errors.cpin}</div>}
                        </div>
                    </div>

                    {searchError && (
                        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px 15px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f5c6cb' }}>
                            {searchError}
                        </div>
                    )}

                    {paymentDetails && (
                        <div style={{ marginBottom: '30px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                            <div style={{ backgroundColor: '#f8f9fa', padding: '10px 15px', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#001b5c' }}>
                                Payment Details
                            </div>
                            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px 30px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                    <span style={{ color: '#666' }}>GSTIN:</span>
                                    <span style={{ fontWeight: '500' }}>{paymentDetails.gstin}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                    <span style={{ color: '#666' }}>CPIN:</span>
                                    <span style={{ fontWeight: '500' }}>{paymentDetails.cpin}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                    <span style={{ color: '#666' }}>Challan Number:</span>
                                    <span style={{ fontWeight: '500' }}>{paymentDetails.challan_number || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                    <span style={{ color: '#666' }}>Payment Amount:</span>
                                    <span style={{ fontWeight: '500' }}>₹{paymentDetails.payment_amount}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                    <span style={{ color: '#666' }}>Payment Date:</span>
                                    <span style={{ fontWeight: '500' }}>{paymentDetails.payment_date ? new Date(paymentDetails.payment_date).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                    <span style={{ color: '#666' }}>Payment Mode:</span>
                                    <span style={{ fontWeight: '500' }}>{paymentDetails.payment_mode || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                    <span style={{ color: '#666' }}>Bank Name:</span>
                                    <span style={{ fontWeight: '500' }}>{paymentDetails.bank_name || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                    <span style={{ color: '#666' }}>Transaction Reference:</span>
                                    <span style={{ fontWeight: '500' }}>{paymentDetails.transaction_reference || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                    <span style={{ color: '#666' }}>Status:</span>
                                    <span style={{ 
                                        fontWeight: '600', 
                                        color: paymentDetails.status === 'Paid' ? '#2e7d32' : paymentDetails.status === 'Failed' ? '#d32f2f' : '#ed6c02'
                                    }}>
                                        {paymentDetails.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                backgroundColor: '#0f4c81', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '10px 24px', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                borderRadius: '4px', 
                                cursor: loading ? 'not-allowed' : 'pointer',
                                textTransform: 'uppercase',
                                opacity: loading ? 0.8 : 1
                            }}
                        >
                            {loading ? 'Tracking...' : 'TRACK STATUS'}
                        </button>
                        <button 
                            type="button"
                            disabled={!paymentDetails}
                            style={{ 
                                backgroundColor: paymentDetails ? '#0f4c81' : '#ccc', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '10px 24px', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                borderRadius: '4px', 
                                cursor: paymentDetails ? 'pointer' : 'not-allowed',
                                textTransform: 'uppercase'
                            }}
                        >
                            VIEW CHALLAN
                        </button>
                        <button 
                            type="button"
                            disabled={!paymentDetails || paymentDetails.status !== 'Paid'}
                            style={{ 
                                backgroundColor: paymentDetails && paymentDetails.status === 'Paid' ? '#0f4c81' : '#ccc', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '10px 24px', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                borderRadius: '4px', 
                                cursor: paymentDetails && paymentDetails.status === 'Paid' ? 'pointer' : 'not-allowed',
                                textTransform: 'uppercase'
                            }}
                        >
                            VIEW RECEIPT
                        </button>
                    </div>

                    <div style={{ backgroundColor: '#e8f4fd', border: '1px solid #b6d4fe', borderRadius: '4px', padding: '15px', fontSize: '13px', color: '#333', lineHeight: '1.6' }}>
                        <div style={{ display: 'flex', marginBottom: '10px' }}>
                            <span style={{ color: '#0056b3', marginRight: '8px', fontSize: '16px' }}>ⓘ</span>
                            <span>If amount is deducted from bank account and not reflected in electronic cash ledger, you may raise grievance under Services &gt; Payments &gt; Grievance against payment (GST PMT-07)</span>
                        </div>
                        <div style={{ display: 'flex', marginBottom: '10px' }}>
                            <span style={{ color: '#0056b3', marginRight: '8px', fontSize: '16px' }}>ⓘ</span>
                            <div>
                                <strong>Awaiting Bank Confirmation:</strong><br />
                                For e-payment mode of payment, if the maker has made a transaction and checker approval is not communicated by bank to GST System.
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <span style={{ color: '#0056b3', marginRight: '8px', fontSize: '16px' }}>ⓘ</span>
                            <div>
                                <strong>Awaiting Bank Clearance:</strong><br />
                                For OTC mode of payment, if bank has acknowledged the challan but remittance confirmation is not communicated by bank to GST System.
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TrackPaymentStatus;
