import React from 'react';
import { Link } from 'react-router-dom';

const MatchingOfflineTool = () => {
    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 120px', minHeight: 'calc(100vh - 200px)' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Downloads</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Return</span>
            </div>

            {/* Main Content Box */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    Matching Offline Tool v2.9
                </h2>

                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '15px', fontSize: '15px' }}>
                    The Matching Offline Tool can be used to:
                </p>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '20px' }}>
                    <li>View GSTR-2B (Auto-drafted Input tax credit (ITC) statement)</li>
                    <li>Match GSTR-2B with Purchase register</li>
                </ol>

                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '15px', fontSize: '15px' }}>
                    To install the tool, please download, extract the zip file and run the Download link.
                </p>

                <a href="#" style={{ display: 'inline-flex', alignItems: 'center', color: '#0056b3', textDecoration: 'none', fontWeight: '500', margin: '10px 0 30px', fontSize: '15px' }}>
                    Download 
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px' }}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </a>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '10px', marginBottom: '15px' }}>Zip file contains:</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ listStyleType: 'disc' }}>GSTR2B_Matching_Tool_v2.9.exe (Application)</li>
                    <li style={{ listStyleType: 'disc' }}>Purchase Register Excel Template</li>
                    <li style={{ listStyleType: 'disc' }}>Readme</li>
                    <li style={{ listStyleType: 'disc' }}>User Manual</li>
                    <li style={{ listStyleType: 'disc' }}>Change History</li>
                </ul>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '10px', marginBottom: '15px' }}>Important:</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ listStyleType: 'disc' }}>Before you extract and run the downloaded file, ensure that the file is not corrupted. Click <a href="#" style={{ color: '#0056b3' }}>here</a> to know more.</li>
                    <li style={{ listStyleType: 'disc' }}>Go through the Readme document before installation.</li>
                    <li style={{ listStyleType: 'disc' }}>Double-click on GSTR2B_Matching_Tool_v2.9.exe to install.</li>
                </ul>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '10px', marginBottom: '15px' }}>What's new:</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ listStyleType: 'disc' }}>GSTR2B_Matching_Tool_v2.9.exe (Released on 28/01/2025) - Updated 2.9 version includes ECO and ECOA sections including importing downloaded JSON from portal. Updated the Matching Tool based on IMS changes.</li>
                </ul>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '10px', marginBottom: '15px' }}>System Requirement:</h3>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li>Operating system ➜ Windows 7 or above. The tool does not work on Linux and Mac.</li>
                    <li>Browser: Internet Explorer 10+, Google Chrome 7+, Firefox 45+</li>
                    <li>Microsoft Excel 2007 & above</li>
                    <li>For below versions, the tool will open in default browser.</li>
                    <li>Ensure 200 MB free disk space.</li>
                </ol>
            </div>
        </div>
    );
};

export default MatchingOfflineTool;
