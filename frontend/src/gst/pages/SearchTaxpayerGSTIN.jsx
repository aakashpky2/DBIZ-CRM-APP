import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SearchTaxpayerGSTIN = () => {
    const [gstin, setGstin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [taxpayer, setTaxpayer] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);


    const handleInputChange = (e) => {
        let value = e.target.value.toUpperCase();
        // Allow only alphanumeric characters
        value = value.replace(/[^A-Z0-9]/g, '');
        if (value.length <= 15) {
            setGstin(value);
            setError('');
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        if (gstin.trim() === '') {
            setError('Please enter a valid GSTIN/UIN.');
            return;
        }

        if (gstin.length !== 15) {
            setError('Enter a Valid 15 Character GSTIN/UIN.');
            return;
        }

        setLoading(true);
        setError('');
        setTaxpayer(null);
        setCopySuccess(false);

        try {
            const response = await api.get(`/search-taxpayer/${gstin}`);
            const data = response.data;

            if (data.success) {
                setTaxpayer(data.data);
            } else {
                setError(data.error || 'No Taxpayer Found for the Entered GSTIN/UIN.');
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

    const copyToClipboard = () => {
        if (taxpayer && taxpayer.gstin) {
            navigator.clipboard.writeText(taxpayer.gstin);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        }
    };

    const downloadPDF = () => {
        if (!taxpayer) return;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Taxpayer Details', 14, 22);

        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        const tableColumn = ["Field", "Details"];
        const tableRows = [
            ["GSTIN/UIN", taxpayer.gstin],
            ["Legal Name of Business", taxpayer.legal_name],
            ["Trade Name", taxpayer.trade_name],
            ["Constitution of Business", taxpayer.constitution_of_business],
            ["Taxpayer Type", taxpayer.taxpayer_type],
            ["Registration Date", taxpayer.registration_date],
            ["GST Status", taxpayer.gst_status],
            ["State Jurisdiction", taxpayer.state_jurisdiction],
            ["Centre Jurisdiction", taxpayer.centre_jurisdiction],
            ["Address", taxpayer.address],
            ["State", taxpayer.state],
            ["District", taxpayer.district],
            ["PIN Code", taxpayer.pincode]
        ];

        doc.autoTable({
            startY: 35,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [15, 76, 129] },
            styles: { fontSize: 10 }
        });

        doc.save(`${taxpayer.gstin}_Taxpayer_Details.pdf`);
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
                    <span style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>Search by GSTIN/UIN</span>
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
                                GSTIN/UIN of the Taxpayer <span style={{ color: '#d32f2f' }}>*</span>
                            </label>
                            <input 
                                type="text" 
                                value={gstin}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter GSTIN/UIN of the Taxpayer"
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
                            <button onClick={downloadPDF} style={{ backgroundColor: '#fff', color: '#0f4c81', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                                Download Details
                            </button>
                        </div>
                        
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                
                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>GSTIN/UIN</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {taxpayer.gstin}
                                        <button onClick={copyToClipboard} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0 }} title="Copy to clipboard">
                                            📋
                                        </button>
                                        {copySuccess && <span style={{ fontSize: '12px', color: '#166534', fontWeight: 'normal' }}>Copied!</span>}
                                    </div>
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
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Constitution of Business</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.constitution_of_business}</div>
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
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>State Jurisdiction</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.state_jurisdiction}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Centre Jurisdiction</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.centre_jurisdiction}</div>
                                </div>

                                <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Principal Place of Business Address</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>
                                        {taxpayer.address}
                                    </div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>State</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.state}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>District</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.district}</div>
                                </div>

                                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>PIN Code</div>
                                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>{taxpayer.pincode}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchTaxpayerGSTIN;
