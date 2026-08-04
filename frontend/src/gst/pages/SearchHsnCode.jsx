import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const SearchHsnCode = () => {
    const [searchMode, setSearchMode] = useState('hsn');
    const [searchUnder, setSearchUnder] = useState('Goods');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Sorting
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!query.trim()) {
            setError('Please enter search criteria.');
            return;
        }

        setError('');
        setLoading(true);
        setResults(null);
        setCurrentPage(1);
        setSortConfig({ key: null, direction: 'asc' });

        try {
            const response = await api.post('/hsn/search', { mode: searchMode, query: query.trim(), category: searchMode === 'description' ? searchUnder : undefined });

            const data = response.data;

            if (data.success && data.data) {
                setResults(data.data);
            } else {
                setError(data.error || 'An error occurred during search.');
            }
        } catch (err) {
            setError('Error searching HSN code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        let apiUrl = import.meta.env.VITE_GST_API_URL || '/api/gst';
        apiUrl = apiUrl.replace(/\/+$/, '')
        window.location.href = `${apiUrl}/hsn/download`;
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedResults = () => {
        if (!results) return [];
        let sortableItems = [...results];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    };

    const sortedResults = getSortedResults();
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = sortedResults.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(sortedResults.length / recordsPerPage);

    const inputStyle = (hasError) => ({
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        border: `1px solid ${hasError ? '#d32f2f' : '#ccc'}`,
        borderRadius: '4px',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: '5px'
    });

    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 80px', minHeight: 'calc(100vh - 200px)' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Services</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>User Services</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Search HSN Code</span>
            </div>

            {/* Main Content Box */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', right: '30px', fontSize: '13px', color: '#333' }}>
                    <span style={{ color: '#d32f2f', fontSize: '16px' }}>•</span> indicates mandatory fields
                </div>

                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', margin: '0 0 20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    Search HSN Code
                </h2>

                <div style={{ marginBottom: '30px' }}>
                    <div style={{ fontWeight: '500', marginBottom: '10px', fontSize: '14px', color: '#333' }}>
                        Search By <span style={{ color: '#d32f2f' }}>*</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input 
                                type="radio" 
                                value="hsn" 
                                checked={searchMode === 'hsn'} 
                                onChange={() => { setSearchMode('hsn'); setQuery(''); setError(''); setResults(null); }}
                                style={{ marginRight: '8px' }}
                            />
                            HSN
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input 
                                type="radio" 
                                value="description" 
                                checked={searchMode === 'description'} 
                                onChange={() => { setSearchMode('description'); setQuery(''); setError(''); setResults(null); }}
                                style={{ marginRight: '8px' }}
                            />
                            Description
                        </label>
                    </div>
                </div>

                {searchMode === 'description' && (
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ fontWeight: '500', marginBottom: '10px', fontSize: '14px', color: '#333' }}>
                            Search Under: <span style={{ color: '#d32f2f' }}>*</span>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    value="Goods" 
                                    checked={searchUnder === 'Goods'} 
                                    onChange={() => { setSearchUnder('Goods'); setResults(null); }}
                                    style={{ marginRight: '8px' }}
                                />
                                Goods
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    value="Services" 
                                    checked={searchUnder === 'Services'} 
                                    onChange={() => { setSearchUnder('Services'); setResults(null); }}
                                    style={{ marginRight: '8px' }}
                                />
                                Services
                            </label>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSearch} style={{ maxWidth: '700px', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                                {searchMode === 'hsn' ? 'Search HSN Chapter by Code ' : 'Search HSN Chapter by Description '}
                                <span style={{ color: '#d32f2f' }}>*</span>
                            </label>
                            <input 
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    if (e.target.value.trim()) setError('');
                                }}
                                placeholder={searchMode === 'hsn' ? 'Search HSN Chapter by digits' : 'Search HSN Chapter by Description'}
                                style={inputStyle(error)}
                            />
                            {error && <div style={{ color: '#d32f2f', fontSize: '12px' }}>{error}</div>}
                        </div>

                        <div style={{ marginTop: '26px' }}>
                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{ 
                                    backgroundColor: '#aab6c8', 
                                    color: '#fff', 
                                    border: 'none', 
                                    padding: '10px 30px', 
                                    fontSize: '14px', 
                                    fontWeight: '500', 
                                    borderRadius: '4px', 
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {loading ? 'Searching...' : 'SEARCH'}
                            </button>
                        </div>
                    </div>
                </form>

                {results !== null && (
                    <div style={{ marginTop: '20px' }}>
                        {results.length === 0 ? (
                            <div style={{ color: '#d32f2f', fontWeight: '500', marginBottom: '20px' }}>
                                No HSN records found.
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div style={{ fontWeight: '500', color: '#333' }}>
                                        Total Records Found: {results.length}
                                    </div>
                                    <button 
                                        onClick={handleDownload}
                                        style={{ color: '#0f4c81', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
                                    >
                                        Download HSN Directory in Excel Format
                                    </button>
                                </div>
                                
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                                <th onClick={() => handleSort('hsn_code')} style={{ padding: '12px', textAlign: 'left', cursor: 'pointer', color: '#001b5c' }}>
                                                    HSN Code {sortConfig.key === 'hsn_code' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                                </th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: '#001b5c' }}>Description</th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: '#001b5c' }}>Chapter</th>
                                                <th onClick={() => handleSort('gst_rate')} style={{ padding: '12px', textAlign: 'right', cursor: 'pointer', color: '#001b5c' }}>
                                                    GST Rate (%) {sortConfig.key === 'gst_rate' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                                </th>
                                                <th style={{ padding: '12px', textAlign: 'left', color: '#001b5c' }}>Category</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRecords.map((item, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                                                    <td style={{ padding: '12px' }}>{item.hsn_code}</td>
                                                    <td style={{ padding: '12px' }}>{item.description}</td>
                                                    <td style={{ padding: '12px' }}>{item.chapter}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right' }}>{item.gst_rate}</td>
                                                    <td style={{ padding: '12px' }}>{item.category}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '5px' }}>
                                        <button 
                                            disabled={currentPage === 1} 
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            style={{ padding: '5px 10px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                        >
                                            Prev
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => setCurrentPage(i + 1)}
                                                style={{ 
                                                    padding: '5px 10px', 
                                                    cursor: 'pointer', 
                                                    backgroundColor: currentPage === i + 1 ? '#0f4c81' : '#fff', 
                                                    color: currentPage === i + 1 ? '#fff' : '#333',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '3px'
                                                }}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button 
                                            disabled={currentPage === totalPages} 
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            style={{ padding: '5px 10px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginTop: '40px', fontSize: '13px', color: '#000', paddingBottom: '30px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <span style={{ color: '#d32f2f', fontWeight: 'bold', fontStyle: 'italic' }}>Note: </span>
                        <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>If HSN of any Goods/Service is otherwise valid but not available here, kindly raise a ticket on GST Self-Service Portal: </span>
                        <a href="https://selfservice.gstsystem.in/" target="_blank" rel="noreferrer" style={{ fontWeight: 'bold', fontStyle: 'italic', color: '#0f4c81', textDecoration: 'underline' }}>
                            https://selfservice.gstsystem.in/
                        </a>
                    </div>
                    
                    <div>
                        <div style={{ fontWeight: 'bold', fontStyle: 'italic', marginBottom: '10px' }}>Disclaimer:</div>
                        <ol style={{ paddingLeft: '20px', margin: '0', fontStyle: 'italic', lineHeight: '1.5' }}>
                            <li style={{ marginBottom: '10px' }}>
                                The revamped Search HSN tool algorithm is based on Artificial Intelligence and Machine Language linked with e-invoice declaration database. Stated differently, the Search tool matches the queried HSN or description with those used by other taxpayers at the time of generating e-invoice. The facility therefore provides prevailing practice of HSN/ description used by IRN-generating taxpayers.
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                The Technical Description and corresponding Commonly used Trade description displayed here is as per the HSN description in the Customs Tariff Act, 1975 corresponding to the Trade description which are widely used by trade in general and are as per the declarations made by taxpayers at the IRN portal and the output displayed is dependent on the input provided by the user. These descriptions as part of Search HSN facility have been provided purely as a measure of Taxpayers' facilitation and are not legally binding on the GST department.
                            </li>
                            <li>
                                Though all efforts have been made to ensure the accuracy and currency of the Search HSN facility, the same should not be construed as a statement of law or used for any legal purposes or any litigation as a legal and binding advice from the GST department/GSTN. GSTN hereby expressly disowns and repudiates any claims or liabilities (including but not limited to any third party claim or liability, of any nature, whatsoever) in relation to the accuracy, completeness, usefulness of any information available through this facility, and against any intended purposes (of any kind whatsoever) by use thereof, by the taxpayer (whether used by taxpayer(s) directly or indirectly).
                            </li>
                        </ol>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SearchHsnCode;
