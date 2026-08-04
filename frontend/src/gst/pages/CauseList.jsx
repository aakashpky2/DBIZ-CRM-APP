import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../api/axios';

const states = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
    "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
    "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const authorities = [
    "Central Tax",
    "State Tax",
    "Union Territory Tax",
    "Integrated Tax",
    "GST Authority",
    "Appellate Authority",
    "Adjudicating Authority"
];

const CauseList = () => {
    const [authorityType, setAuthorityType] = useState('');
    const [state, setState] = useState('');
    const [jurisdiction, setJurisdiction] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    // Sorting
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Modal
    const [selectedCase, setSelectedCase] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!authorityType || !state) {
            setError('Type of Authority and State are mandatory fields.');
            return;
        }

        setError('');
        setLoading(true);
        setResults(null);
        setCurrentPage(1);

        try {
            const response = await api.post('/cause-list/search', {
                authority_type: authorityType,
                state: state,
                jurisdiction: jurisdiction,
                date: date
            });

            const data = response.data;

            if (data.success) {
                setResults(data.data);
            } else {
                setError(data.error || 'An error occurred while fetching the cause list.');
            }
        } catch (err) {
            setError('Error searching cause list. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getFilteredAndSortedResults = () => {
        if (!results) return [];
        
        let filtered = results;
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = results.filter(item => 
                Object.values(item).some(val => 
                    val && val.toString().toLowerCase().includes(lowerQuery)
                )
            );
        }

        if (sortConfig.key !== null) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    };

    const displayResults = getFilteredAndSortedResults();
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = displayResults.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(displayResults.length / recordsPerPage);

    const downloadExcel = () => {
        const queryParams = new URLSearchParams({
            authority_type: authorityType,
            state: state,
            jurisdiction: jurisdiction,
            date: date
        }).toString();
        let apiUrl = import.meta.env.VITE_GST_API_URL || '/api/gst';
        apiUrl = apiUrl.replace(/\/+$/, '')
        window.location.href = `${apiUrl}/cause-list/download-excel?${queryParams}`;
    };

    const downloadPDF = () => {
        const doc = new jsPDF('landscape');
        doc.text('Cause List', 14, 15);
        
        const tableColumn = ["Cause Number", "Case Reference", "GSTIN", "Taxpayer Name", "Authority Type", "State", "Date", "Status"];
        const tableRows = [];

        displayResults.forEach(item => {
            const rowData = [
                item.cause_number,
                item.case_reference,
                item.gstin,
                item.taxpayer_name,
                item.authority_type,
                item.state,
                item.hearing_date,
                item.case_status
            ];
            tableRows.push(rowData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });
        
        doc.save('Cause_List.pdf');
    };

    const printList = () => {
        window.print();
    };

    const inputStyle = (hasError) => ({
        width: '100%',
        padding: '8px 12px',
        fontSize: '14px',
        border: `1px solid ${hasError ? '#d32f2f' : '#ccc'}`,
        borderRadius: '4px',
        outline: 'none',
        boxSizing: 'border-box',
        backgroundColor: '#fff'
    });

    const getJurisdictions = () => {
        if (!authorityType) return [];
        return [`Jurisdiction A`, `Jurisdiction B`, `Jurisdiction C`];
    };

    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 80px', minHeight: 'calc(100vh - 200px)' }}>
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <span style={{ color: '#4b5563' }}>Dashboard</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Services</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>User Services</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Cause List</span>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', right: '30px', fontSize: '13px', color: '#333' }}>
                    <span style={{ color: '#d32f2f', fontSize: '16px' }}>•</span> indicates mandatory fields
                </div>

                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', margin: '0 0 20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    Cause List
                </h2>

                <form onSubmit={handleSearch} style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', marginBottom: '20px' }}>
                        {/* LEFT COLUMN */}
                        <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                                    Type of Authority <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <select 
                                    value={authorityType} 
                                    onChange={(e) => { setAuthorityType(e.target.value); setJurisdiction(''); setError(''); }}
                                    style={inputStyle(error && !authorityType)}
                                >
                                    <option value="">Select</option>
                                    {authorities.map(auth => <option key={auth} value={auth}>{auth}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                                    Jurisdiction
                                </label>
                                <select 
                                    value={jurisdiction} 
                                    onChange={(e) => setJurisdiction(e.target.value)}
                                    style={inputStyle(false)}
                                >
                                    <option value="">Select</option>
                                    {getJurisdictions().map(jur => <option key={jur} value={jur}>{jur}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                                    State <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <select 
                                    value={state} 
                                    onChange={(e) => { setState(e.target.value); setError(''); }}
                                    style={inputStyle(error && !state)}
                                >
                                    <option value="">Select</option>
                                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                                    Date
                                </label>
                                <input 
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    style={inputStyle(false)}
                                />
                            </div>
                        </div>
                    </div>

                    {error && <div style={{ color: '#d32f2f', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                backgroundColor: '#0f4c81', 
                                color: '#fff', 
                                border: 'none', 
                                padding: '10px 40px', 
                                fontSize: '14px', 
                                fontWeight: '500', 
                                borderRadius: '4px', 
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'SEARCHING...' : 'SEARCH'}
                        </button>
                    </div>
                </form>

                {results !== null && (
                    <div style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '30px' }}>
                        {results.length === 0 ? (
                            <div style={{ color: '#d32f2f', fontWeight: '500', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                                No Cause List records available for the selected criteria.
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={downloadExcel} style={{ padding: '6px 12px', fontSize: '13px', cursor: 'pointer', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '3px' }}>Export to Excel</button>
                                        <button onClick={downloadPDF} style={{ padding: '6px 12px', fontSize: '13px', cursor: 'pointer', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '3px' }}>Export to PDF</button>
                                        <button onClick={printList} style={{ padding: '6px 12px', fontSize: '13px', cursor: 'pointer', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '3px' }}>Print Cause List</button>
                                    </div>
                                    <div>
                                        <input 
                                            type="text" 
                                            placeholder="Search inside results..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ padding: '6px 12px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '3px' }}
                                        />
                                    </div>
                                </div>
                                
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '1000px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                                <th onClick={() => handleSort('cause_number')} style={{ padding: '12px', textAlign: 'left', cursor: 'pointer', color: '#001b5c', whiteSpace: 'nowrap' }}>Cause Number {sortConfig.key === 'cause_number' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: '#001b5c' }}>Case Reference</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: '#001b5c' }}>GSTIN</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: '#001b5c' }}>Taxpayer Name</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: '#001b5c' }}>Authority Type</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: '#001b5c' }}>State</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: '#001b5c' }}>Hearing Date</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: '#001b5c' }}>Status</th>
                                                <th style={{ padding: '12px', textAlign: 'center', color: '#001b5c' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRecords.map((item, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                    <td style={{ padding: '12px' }}>{item.cause_number}</td>
                                                    <td style={{ padding: '12px' }}>{item.case_reference}</td>
                                                    <td style={{ padding: '12px' }}>{item.gstin}</td>
                                                    <td style={{ padding: '12px' }}>{item.taxpayer_name}</td>
                                                    <td style={{ padding: '12px' }}>{item.authority_type}</td>
                                                    <td style={{ padding: '12px' }}>{item.state}</td>
                                                    <td style={{ padding: '12px' }}>{item.hearing_date}</td>
                                                    <td style={{ padding: '12px', fontWeight: '500', color: item.case_status === 'Scheduled' ? '#0f4c81' : '#333' }}>{item.case_status}</td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                        <button 
                                                            onClick={() => setSelectedCase(item)}
                                                            style={{ color: '#3b82f6', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '5px' }}>
                                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: currentPage === i + 1 ? '#0f4c81' : '#fff', color: currentPage === i + 1 ? '#fff' : '#333', border: '1px solid #ccc' }}>
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Modal for View Details */}
                {selectedCase && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ backgroundColor: '#fff', width: '600px', maxWidth: '90%', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: '#f1f3f6', padding: '15px 20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', color: '#001b5c' }}>Case Details: {selectedCase.cause_number}</h3>
                                <button onClick={() => setSelectedCase(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#333' }}>&times;</button>
                            </div>
                            <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <tbody>
                                        {[
                                            ['Cause Number', selectedCase.cause_number],
                                            ['Case Reference', selectedCase.case_reference],
                                            ['GSTIN', selectedCase.gstin],
                                            ['Taxpayer Name', selectedCase.taxpayer_name],
                                            ['Authority', selectedCase.authority_type],
                                            ['Jurisdiction', selectedCase.jurisdiction || '-'],
                                            ['State', selectedCase.state],
                                            ['Hearing Date', selectedCase.hearing_date],
                                            ['Hearing Time', selectedCase.hearing_time],
                                            ['Status', selectedCase.case_status],
                                            ['Venue', selectedCase.venue],
                                            ['Subject', selectedCase.case_subject],
                                            ['Remarks', selectedCase.remarks || '-']
                                        ].map(([label, value]) => (
                                            <tr key={label}>
                                                <td style={{ padding: '10px', border: '1px solid #eee', backgroundColor: '#fafafa', fontWeight: '500', width: '40%' }}>{label}</td>
                                                <td style={{ padding: '10px', border: '1px solid #eee' }}>{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ padding: '15px 20px', borderTop: '1px solid #ccc', textAlign: 'right' }}>
                                <button onClick={() => setSelectedCase(null)} style={{ padding: '8px 20px', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '3px', cursor: 'pointer' }}>Close</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CauseList;
