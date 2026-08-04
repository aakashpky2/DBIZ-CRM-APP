import React from 'react';
import { Link } from 'react-router-dom';

const GSTR7OfflineUtility = () => {
    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 120px', minHeight: 'calc(100vh - 200px)' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Downloads</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>GSTR7</span>
            </div>

            {/* Main Content Box */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    GSTR7 Offline Utility (v4.1)
                </h2>

                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '20px', fontSize: '15px' }}>
                    The excel based GSTR7 offline utility is designed to help the taxpayer to prepare the GSTR7 return offline. The utility can be downloaded from this link.
                </p>

                <a href="#" style={{ display: 'inline-flex', alignItems: 'center', color: '#0056b3', textDecoration: 'none', fontWeight: '500', margin: '10px 0 30px', fontSize: '15px' }}>
                    Download 
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px' }}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '10px', marginBottom: '15px' }}>Important!</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ listStyleType: 'disc' }}>Before you extract the downloaded file, ensure that the file is not corrupted.</li>
                    <li style={{ listStyleType: 'disc' }}>How do I know that my file is not corrupt?</li>
                    <li style={{ listStyleType: 'disc' }}>Click <a href="#" style={{ color: '#0056b3' }}>here</a> to know more.</li>
                </ul>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '10px', marginBottom: '15px' }}>System Requirement</h3>
                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '15px', fontSize: '15px', fontWeight: '500' }}>
                    To use the tool efficiently, ensure that you have the following installed on your system:
                </p>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', listStyleType: 'none', margin: 0 }}>
                    <li style={{ marginBottom: '8px' }}>1. Operating system ➜ Windows 7 or above.</li>
                    <li>2. Microsoft Excel 2007 & above</li>
                </ul>
            </div>
        </div>
    );
};

export default GSTR7OfflineUtility;
