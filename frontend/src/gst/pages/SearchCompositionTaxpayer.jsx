import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SearchCompositionTaxpayer = () => {
    const [optStatus, setOptStatus] = useState('');
    const [searchType, setSearchType] = useState('GSTIN');
    const [gstin, setGstin] = useState('');
    const [state, setState] = useState('');
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    
    // Pagination
    const [recordsPerPage, setRecordsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const states = [
        "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
        "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli",
        "Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
        "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
        "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra",
        "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
        "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ];


    const handleGstinChange = (e) => {
        let value = e.target.value.toUpperCase();
        value = value.replace(/[^A-Z0-9]/g, '');
        if (value.length <= 15) {
            setGstin(value);
            if (errors.gstin) setErrors({...errors, gstin: null});
        }
    };

    const validateForm = () => {
        let newErrors = {};
        
        if (!optStatus) {
            newErrors.optStatus = 'Please select Opt In / Opt Out status.';
        }
        
        if (searchType === 'GSTIN') {
            if (!gstin) {
                newErrors.gstin = 'Please enter GSTIN/UIN.';
            } else if (gstin.length !== 15) {
                newErrors.gstin = 'Enter a valid 15-character GSTIN/UIN.';
            }
        } else {
            if (!state) {
                newErrors.state = 'Please select a State.';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setResults(null);
        setCurrentPage(1);

        try {
            const response = await api.post('/search-taxpayer/composition', {
                searchType,
                optStatus,
                gstin: searchType === 'GSTIN' ? gstin : undefined,
                state: searchType === 'State' ? state : undefined
            });
            
            const data = response.data;

            if (data.success) {
                setResults(data.data);
            } else {
                setErrors({ general: data.error || 'No Composition Taxpayer Records Found.' });
            }
        } catch (err) {
            console.error('Search error:', err);
            setErrors({ general: 'Unable to Fetch Details. Please Try Again.' });
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!results || results.length === 0) return;

        const doc = new jsPDF('landscape');
        doc.setFontSize(16);
        doc.text('Composition Taxpayer Search Results', 14, 20);

        doc.setFontSize(10);
        doc.text(`Status: ${optStatus.replace('_', ' ')} | Searched By: ${searchType === 'GSTIN' ? gstin : state}`, 14, 28);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

        const tableColumn = ["GSTIN/UIN", "Legal Name", "Trade Name", "State", "Registration Date", "Composition Status"];
        const tableRows = results.map(r => [
            r.gstin, r.legal_name, r.trade_name, r.state, r.registration_date, r.composition_status.replace('_', ' ')
        ]);

        doc.autoTable({
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [15, 76, 129] },
            styles: { fontSize: 9 }
        });

        doc.save(`Composition_Taxpayers_${new Date().getTime()}.pdf`);
    };

    const downloadExcel = () => {
        if (!results || results.length === 0) return;
        
        const header = ["GSTIN/UIN", "Legal Name", "Trade Name", "State", "Registration Date", "Composition Status"];
        const rows = results.map(r => [
            `"${r.gstin}"`, 
            `"${r.legal_name}"`, 
            `"${r.trade_name}"`, 
            `"${r.state}"`, 
            `"${r.registration_date}"`, 
            `"${r.composition_status.replace('_', ' ')}"`
        ]);
        
        const csvContent = [header.join(','), ...rows.map(e => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Composition_Taxpayers_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderStatusBadge = (status) => {
        if (status === 'OPTED_IN') {
            return <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>OPTED IN</span>;
        }
        return <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>OPTED OUT</span>;
    };

    // Pagination Logic
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = results ? results.slice(indexOfFirstRecord, indexOfLastRecord) : [];
    const totalPages = results ? Math.ceil(results.length / recordsPerPage) : 0;

    return (
        <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px' }}>
                    <Link to="/" style={{ color: '#0056b3', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
                    <span style={{ color: '#666', margin: '0 8px', fontSize: '14px' }}>&gt;</span>
                    <span style={{ color: '#666', fontSize: '14px' }}>Search Taxpayer</span>
                    <span style={{ color: '#666', margin: '0 8px', fontSize: '14px' }}>&gt;</span>
                    <span style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>Search Composition Taxpayer</span>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
                <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ color: '#001b5c', margin: 0, fontSize: '18px', fontWeight: 'normal' }}>Search taxpayer opted In/ Out for Composition</h2>
                        <span style={{ color: '#d32f2f', fontSize: '12px' }}>* indicates mandatory fields</span>
                    </div>
                    
                    <div style={{ padding: '30px', maxWidth: '600px' }}>
                        
                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#333' }}>
                                Opt In / Opt Out <span style={{ color: '#d32f2f' }}>*</span>
                            </label>
                            <select 
                                value={optStatus}
                                onChange={(e) => {
                                    setOptStatus(e.target.value);
                                    if (errors.optStatus) setErrors({...errors, optStatus: null});
                                }}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                            >
                                <option value="">Select</option>
                                <option value="OPTED_IN">Opted In for Composition</option>
                                <option value="OPTED_OUT">Opted Out from Composition</option>
                            </select>
                            {errors.optStatus && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.optStatus}</div>}
                        </div>

                        <div style={{ display: 'flex', gap: '30px', marginBottom: '25px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    name="searchType" 
                                    value="GSTIN" 
                                    checked={searchType === 'GSTIN'} 
                                    onChange={() => { setSearchType('GSTIN'); setErrors({}); }} 
                                />
                                GSTIN/UIN
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    name="searchType" 
                                    value="State" 
                                    checked={searchType === 'State'} 
                                    onChange={() => { setSearchType('State'); setErrors({}); }} 
                                />
                                State
                            </label>
                        </div>

                        {searchType === 'GSTIN' ? (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#333' }}>
                                    GSTIN/UIN <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={gstin}
                                    onChange={handleGstinChange}
                                    placeholder="Enter GSTIN/UIN"
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                                />
                                {errors.gstin && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.gstin}</div>}
                            </div>
                        ) : (
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#333' }}>
                                    State <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <select 
                                    value={state}
                                    onChange={(e) => {
                                        setState(e.target.value);
                                        if (errors.state) setErrors({...errors, state: null});
                                    }}
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                                >
                                    <option value="">Select State</option>
                                    {states.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                                </select>
                                {errors.state && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.state}</div>}
                            </div>
                        )}

                        {errors.general && (
                            <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span>ℹ️</span> {errors.general}
                            </div>
                        )}

                        <button 
                            onClick={handleSearch}
                            disabled={loading || (!optStatus || (searchType === 'GSTIN' && !gstin) || (searchType === 'State' && !state))}
                            style={{ 
                                backgroundColor: '#0f4c81', 
                                color: 'white', 
                                border: 'none', 
                                padding: '10px 30px', 
                                borderRadius: '4px', 
                                marginTop: '20px',
                                cursor: (loading || (!optStatus || (searchType === 'GSTIN' && !gstin) || (searchType === 'State' && !state))) ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                opacity: (loading || (!optStatus || (searchType === 'GSTIN' && !gstin) || (searchType === 'State' && !state))) ? 0.6 : 1
                            }}
                        >
                            {loading ? 'SEARCHING...' : 'SEARCH'}
                        </button>
                    </div>
                </div>

                {/* Loading indicator for table */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', marginTop: '20px' }}>
                        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: '#0f4c81', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <p style={{ marginTop: '10px', color: '#666' }}>Fetching Records...</p>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {/* Results Section */}
                {results && !loading && (
                    <div style={{ marginTop: '30px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', padding: '20px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                Total Records Found: {results.length}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={downloadExcel} style={{ backgroundColor: '#217346', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span>📊</span> Export Excel
                                </button>
                                <button onClick={downloadPDF} style={{ backgroundColor: '#e24e42', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span>📄</span> Export PDF
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontSize: '13px', color: '#555' }}>
                            <div>
                                Show 
                                <select 
                                    value={recordsPerPage} 
                                    onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                    style={{ margin: '0 5px', padding: '3px 5px', borderRadius: '3px', border: '1px solid #ccc' }}
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select> 
                                entries
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd', borderTop: '1px solid #ddd' }}>
                                        <th style={{ padding: '12px 10px', color: '#333' }}>GSTIN/UIN</th>
                                        <th style={{ padding: '12px 10px', color: '#333' }}>Legal Name</th>
                                        <th style={{ padding: '12px 10px', color: '#333' }}>Trade Name</th>
                                        <th style={{ padding: '12px 10px', color: '#333' }}>State</th>
                                        <th style={{ padding: '12px 10px', color: '#333' }}>Registration Date</th>
                                        <th style={{ padding: '12px 10px', color: '#333' }}>Composition Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRecords.map((r, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px 10px', color: '#0056b3', fontWeight: '500' }}>{r.gstin}</td>
                                            <td style={{ padding: '12px 10px' }}>{r.legal_name}</td>
                                            <td style={{ padding: '12px 10px' }}>{r.trade_name}</td>
                                            <td style={{ padding: '12px 10px' }}>{r.state}</td>
                                            <td style={{ padding: '12px 10px' }}>{r.registration_date}</td>
                                            <td style={{ padding: '12px 10px' }}>{renderStatusBadge(r.composition_status)}</td>
                                        </tr>
                                    ))}
                                    {currentRecords.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>No Records to display.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '5px' }}>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    style={{ padding: '5px 10px', border: '1px solid #ccc', backgroundColor: currentPage === 1 ? '#f9f9f9' : '#fff', color: currentPage === 1 ? '#aaa' : '#333', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '3px' }}
                                >
                                    Previous
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setCurrentPage(i + 1)}
                                        style={{ 
                                            padding: '5px 10px', 
                                            border: '1px solid #ccc', 
                                            backgroundColor: currentPage === i + 1 ? '#0f4c81' : '#fff', 
                                            color: currentPage === i + 1 ? 'white' : '#333', 
                                            cursor: 'pointer', 
                                            borderRadius: '3px' 
                                        }}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '5px 10px', border: '1px solid #ccc', backgroundColor: currentPage === totalPages ? '#f9f9f9' : '#fff', color: currentPage === totalPages ? '#aaa' : '#333', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', borderRadius: '3px' }}
                                >
                                    Next
                                </button>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchCompositionTaxpayer;
