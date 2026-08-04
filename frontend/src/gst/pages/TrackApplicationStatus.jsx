import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TrackApplicationStatus = () => {
    const [searchType, setSearchType] = useState('ARN');
    const [searchValue, setSearchValue] = useState('');
    const [error, setError] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchValue.trim()) {
            setError('This field is required');
        } else {
            setError('');
            // Perform search logic if necessary
        }
    };

    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 120px', minHeight: 'calc(100vh - 200px)' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Registration</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Track Application Status</span>
            </div>

            {/* Main Content Box */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', margin: 0 }}>
                        Track Application Status
                    </h2>
                    <span style={{ color: '#d32f2f', fontSize: '13px' }}>
                        <span style={{ fontSize: '16px' }}>•</span> indicates mandatory fields
                    </span>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '30px', cursor: 'pointer', fontSize: '15px', color: '#333' }}>
                        <input 
                            type="radio" 
                            name="searchType" 
                            value="ARN" 
                            checked={searchType === 'ARN'} 
                            onChange={(e) => {
                                setSearchType(e.target.value);
                                setError('');
                                setSearchValue('');
                            }}
                            style={{ marginRight: '8px', cursor: 'pointer' }}
                        />
                        ARN
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', fontSize: '15px', color: '#333' }}>
                        <input 
                            type="radio" 
                            name="searchType" 
                            value="SRN/FRN" 
                            checked={searchType === 'SRN/FRN'} 
                            onChange={(e) => {
                                setSearchType(e.target.value);
                                setError('');
                                setSearchValue('');
                            }}
                            style={{ marginRight: '8px', cursor: 'pointer' }}
                        />
                        SRN/FRN
                    </label>
                </div>

                <form onSubmit={handleSearch} style={{ maxWidth: '400px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                            {searchType} <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <input 
                            type="text" 
                            value={searchValue}
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                                if (e.target.value.trim()) setError('');
                            }}
                            placeholder={`Enter ${searchType}`}
                            style={{ 
                                width: '100%', 
                                padding: '10px 12px', 
                                fontSize: '14px', 
                                border: `1px solid ${error ? '#d32f2f' : '#ccc'}`, 
                                borderRadius: '4px',
                                outline: 'none'
                            }}
                        />
                        {error && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px' }}>{error}</div>}
                    </div>

                    <button 
                        type="submit" 
                        style={{ 
                            backgroundColor: '#0f4c81', 
                            color: '#fff', 
                            border: 'none', 
                            padding: '10px 24px', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}
                    >
                        SEARCH
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TrackApplicationStatus;
