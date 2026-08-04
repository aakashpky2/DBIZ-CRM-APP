import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const SearchTaxpayerPAN = () => {
    const [pan, setPan] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [taxpayer, setTaxpayer] = useState(null);


    const handleInputChange = (e) => {
        let value = e.target.value.toUpperCase();
        // Allow only alphanumeric characters
        value = value.replace(/[^A-Z0-9]/g, '');
        if (value.length <= 10) {
            setPan(value);
            setError('');
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        if (pan.trim() === '') {
            setError('Please enter a valid PAN.');
            return;
        }

        if (pan.length !== 10 || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
            setError('Please enter a valid PAN.');
            return;
        }

        setLoading(true);
        setError('');
        setTaxpayer(null);

        try {
            const response = await api.get(`/search-taxpayer/pan/${pan}`);
            const data = response.data;

            if (data.success) {
                setTaxpayer(data.data);
            } else {
                setError(data.error || 'No taxpayer found for the entered PAN.');
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Unable to Fetch Taxpayer Details. Please Try Again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const renderStatusBadge = (status) => {
        let bgColor = '#f3f4f6';
        let color = '#374151';
        let icon = 'ℹ️';

        if (status.toLowerCase() === 'active') {
            bgColor = '#dcfce7';
            color = '#166534';
            icon = '✅';
        } else if (status.toLowerCase() === 'cancelled') {
            bgColor = '#fee2e2';
            color = '#991b1b';
            icon = '❌';
        } else if (status.toLowerCase() === 'suspended') {
            bgColor = '#ffedd5';
            color = '#9a3412';
            icon = '⚠️';
        }

        return (
            <span style={{ 
                backgroundColor: bgColor, 
                color: color, 
                padding: '4px 12px', 
                borderRadius: '16px', 
                fontSize: '12px', 
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                {icon} {status.toUpperCase()}
            </span>
        );
    };

    return (
        <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Breadcrumb Area */}
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px' }}>
                    <Link to="/" style={{ color: '#0056b3', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
                    <span style={{ color: '#666', margin: '0 8px', fontSize: '14px' }}>&gt;</span>
                    <span style={{ color: '#666', fontSize: '14px' }}>Search Taxpayer</span>
                    <span style={{ color: '#666', margin: '0 8px', fontSize: '14px' }}>&gt;</span>
                    <span style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>Search by PAN</span>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
                <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ color: '#001b5c', margin: 0, fontSize: '18px', fontWeight: 'normal' }}>Search Taxpayer</h2>
                        <span style={{ color: '#d32f2f', fontSize: '12px' }}>* indicates mandatory fields</span>
                    </div>
                    
                    <div style={{ padding: '30px' }}>
                        <div style={{ maxWidth: '500px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#333' }}>
                                Permanent Account Number (PAN) <span style={{ color: '#d32f2f' }}>*</span>
                            </label>
                            <input 
                                type="text" 
                                value={pan}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Permanent Account Number (PAN)"
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 12px', 
                                    border: '1px solid #ccc', 
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    marginBottom: '5px'
                                }}
                            />
                            {error && (
                                <div style={{ color: '#d32f2f', fontSize: '13px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span>ℹ️</span> {error}
                                </div>
                            )}

                            <button 
                                onClick={handleSearch}
                                disabled={loading}
                                style={{ 
                                    backgroundColor: '#0f4c81', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '10px 30px', 
                                    borderRadius: '4px', 
                                    marginTop: '20px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'SEARCHING...' : 'SEARCH'}
                            </button>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', marginTop: '20px' }}>
                        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: '#0f4c81', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <p style={{ marginTop: '10px', color: '#666' }}>Searching Taxpayer...</p>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {taxpayer && !loading && (
                    <div style={{ marginTop: '30px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#0f4c81', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'normal' }}>Taxpayer Details</h3>
                        </div>
                        
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                
                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>PAN</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.pan}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>GSTIN/UIN</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.gstin}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Legal Name of Business</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.legal_name}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Trade Name</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.trade_name}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Taxpayer Type</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.taxpayer_type}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Registration Date</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.registration_date}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>GST Status</div>
                                    <div>{renderStatusBadge(taxpayer.gst_status)}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>State</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.state}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>District</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.district}</div>
                                </div>

                                <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Principal Place of Business Address</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>
                                        {taxpayer.address}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchTaxpayerPAN;
