import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

// Mock district list for simplicity
const mockDistricts = [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", // MH
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", // GJ
    "New Delhi", "Central Delhi", "South Delhi" // DL
];

const LocateGstp = () => {
    const [searchType, setSearchType] = useState('id'); // 'id' or 'name_area'
    
    // Form States
    const [idValue, setIdValue] = useState('');
    const [nameValue, setNameValue] = useState('');
    const [stateValue, setStateValue] = useState('');
    const [districtValue, setDistrictValue] = useState('');
    const [pincodeValue, setPincodeValue] = useState('');

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();

        // Validation
        if (searchType === 'id') {
            if (!idValue.trim()) {
                setError('Enrollment Number/GSTP ID is a mandatory field.');
                return;
            }
            if (!/^[a-zA-Z0-9]+$/.test(idValue)) {
                setError('Please enter a valid alphanumeric Enrollment Number/GSTP ID.');
                return;
            }
        } else {
            if (!stateValue) {
                setError('State is a mandatory field.');
                return;
            }
        }

        setError('');
        setLoading(true);
        setResults(null);

        try {
            const response = await api.post('/gstp/search', { 
                searchType, 
                idValue: idValue.trim(), 
                nameValue: nameValue.trim(), 
                stateValue, 
                districtValue,
                pincodeValue: pincodeValue.trim()
            });

            const data = response.data;

            if (data.success) {
                setResults(data.data);
            } else {
                setError(data.error || 'An error occurred while searching.');
            }
        } catch (err) {
            setError('Error connecting to the server. Please try again later.');
        } finally {
            setLoading(false);
        }
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
                <span style={{ color: '#4b5563' }}>Locate GST Practitioner (GSTP)</span>
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', right: '30px', fontSize: '13px', color: '#333' }}>
                    <span style={{ color: '#d32f2f', fontSize: '16px' }}>•</span> indicates mandatory fields
                </div>

                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', margin: '0 0 20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    Locate GST Practitioner (GSTP)
                </h2>

                <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '30px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                            <input 
                                type="radio" 
                                name="searchType" 
                                value="id" 
                                checked={searchType === 'id'} 
                                onChange={() => { setSearchType('id'); setError(''); setResults(null); }}
                                style={{ marginRight: '8px', cursor: 'pointer' }}
                            />
                            Enrollment Number / GSTP ID
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#333' }}>
                            <input 
                                type="radio" 
                                name="searchType" 
                                value="name_area" 
                                checked={searchType === 'name_area'} 
                                onChange={() => { setSearchType('name_area'); setError(''); setResults(null); }}
                                style={{ marginRight: '8px', cursor: 'pointer' }}
                            />
                            Name / Area
                        </label>
                    </div>
                </div>

                <form onSubmit={handleSearch}>
                    {searchType === 'id' ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', marginBottom: '30px' }}>
                            <div style={{ flex: '1 1 30%', minWidth: '300px', maxWidth: '400px' }}>
                                <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                                    Enrollment Number/GSTP ID <span style={{ color: '#d32f2f' }}>*</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={idValue}
                                    onChange={(e) => { setIdValue(e.target.value); setError(''); }}
                                    placeholder="Enter Enrollment Number/GSTP ID"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        border: `1px solid ${error && searchType === 'id' ? '#d32f2f' : '#ccc'}`,
                                        borderRadius: '4px',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                            <div style={{ flex: '0 0 auto' }}>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    style={{ 
                                        backgroundColor: '#0f4c81', 
                                        color: '#fff', 
                                        border: 'none', 
                                        padding: '10px 30px', 
                                        fontSize: '14px', 
                                        fontWeight: '500', 
                                        borderRadius: '4px', 
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? 'SEARCHING...' : 'SEARCH'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' }}>
                                <div style={{ flex: '1 1 20%', minWidth: '180px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                                        Name
                                    </label>
                                    <input 
                                        type="text" 
                                        value={nameValue}
                                        onChange={(e) => { setNameValue(e.target.value); setError(''); }}
                                        placeholder="Enter name of GSTP"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            fontSize: '14px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                                <div style={{ flex: '1 1 20%', minWidth: '180px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                                        State <span style={{ color: '#d32f2f' }}>*</span>
                                    </label>
                                    <select 
                                        value={stateValue}
                                        onChange={(e) => { setStateValue(e.target.value); setError(''); }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            fontSize: '14px',
                                            border: `1px solid ${error && searchType === 'name_area' && !stateValue ? '#d32f2f' : '#ccc'}`,
                                            borderRadius: '4px',
                                            outline: 'none',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        <option value="">Select</option>
                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: '1 1 20%', minWidth: '180px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                                        District
                                    </label>
                                    <select 
                                        value={districtValue}
                                        onChange={(e) => { setDistrictValue(e.target.value); setError(''); }}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            fontSize: '14px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            outline: 'none',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        <option value="">Select</option>
                                        {mockDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: '1 1 20%', minWidth: '180px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                                        Pincode
                                    </label>
                                    <input 
                                        type="text" 
                                        value={pincodeValue}
                                        onChange={(e) => { setPincodeValue(e.target.value); setError(''); }}
                                        placeholder="Enter Pincode"
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            fontSize: '14px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    style={{ 
                                        backgroundColor: '#0f4c81', 
                                        color: '#fff', 
                                        border: 'none', 
                                        padding: '10px 30px', 
                                        fontSize: '14px', 
                                        fontWeight: '500', 
                                        borderRadius: '4px', 
                                        cursor: loading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loading ? 'SEARCHING...' : 'SEARCH'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                {error && <div style={{ color: '#d32f2f', fontSize: '13px', marginBottom: '20px' }}>{error}</div>}

                {results !== null && (
                    <div style={{ marginTop: '20px' }}>
                        {results.length === 0 ? (
                            <div style={{ color: '#d32f2f', fontWeight: '500', fontSize: '14px', textAlign: 'center', padding: '30px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: '#f9fafb' }}>
                                No GST Practitioner found.
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#e2e8f0', color: '#333' }}>
                                            <th style={{ padding: '12px 15px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>GSTP Name</th>
                                            <th style={{ padding: '12px 15px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>GSTP ID</th>
                                            <th style={{ padding: '12px 15px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Enrollment Number</th>
                                            <th style={{ padding: '12px 15px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Mobile Number</th>
                                            <th style={{ padding: '12px 15px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>Email</th>
                                            <th style={{ padding: '12px 15px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>State</th>
                                            <th style={{ padding: '12px 15px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>District</th>
                                            <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((row, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                                                <td style={{ padding: '12px 15px', color: '#333', borderRight: '1px solid #e5e7eb' }}>{row.name}</td>
                                                <td style={{ padding: '12px 15px', color: '#333', borderRight: '1px solid #e5e7eb' }}>{row.gstp_id}</td>
                                                <td style={{ padding: '12px 15px', color: '#333', borderRight: '1px solid #e5e7eb' }}>{row.enrollment_number}</td>
                                                <td style={{ padding: '12px 15px', color: '#333', borderRight: '1px solid #e5e7eb' }}>{row.mobile.replace(/.(?=.{4})/g, 'x')}</td>
                                                <td style={{ padding: '12px 15px', color: '#333', borderRight: '1px solid #e5e7eb' }}>{row.email}</td>
                                                <td style={{ padding: '12px 15px', color: '#333', borderRight: '1px solid #e5e7eb' }}>{row.state}</td>
                                                <td style={{ padding: '12px 15px', color: '#333', borderRight: '1px solid #e5e7eb' }}>{row.district}</td>
                                                <td style={{ padding: '12px 15px' }}>
                                                    <span style={{ 
                                                        color: row.status.toLowerCase() === 'active' ? '#15803d' : '#b91c1c', 
                                                        backgroundColor: row.status.toLowerCase() === 'active' ? '#dcfce7' : '#fee2e2',
                                                        padding: '4px 8px', 
                                                        borderRadius: '12px', 
                                                        fontWeight: '500', 
                                                        fontSize: '11px',
                                                        display: 'inline-block'
                                                    }}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocateGstp;
