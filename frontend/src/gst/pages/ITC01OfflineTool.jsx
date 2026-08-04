import React from 'react';
import { Link } from 'react-router-dom';

const ITC01OfflineTool = () => {
    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 120px', minHeight: 'calc(100vh - 200px)' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Downloads</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>ITC-01</span>
            </div>

            {/* Main Content Box */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    ITC-01 Offline Tool v1.3
                </h2>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>
                    Who should fill GST ITC-01 form?
                </h3>
                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '15px', fontSize: '15px' }}>
                    You need to fill ITC-01 to declare details for following Tables/Sections:
                </p>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '20px' }}>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>Table 7 - Claim under section 18(1)(a) or section 18(1)(b): Applicable for claim of input tax credit in case of new registration and voluntary registration</li>
                    <li style={{ listStyleType: 'disc' }}>Table 8 - Claim under section 18(1)(c) or section 18(1)(d): Applicable for taxpayer opting out from Composition levy or goods/services becomes taxable</li>
                </ul>

                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '15px', fontSize: '15px' }}>
                    Claim credit on:
                </p>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>Inputs held in stock</li>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>Inputs contained in semi-finished or finished goods held in stock</li>
                    <li style={{ listStyleType: 'disc' }}>Capital goods</li>
                </ul>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>
                    How do I prepare the form when offline:
                </h3>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ marginBottom: '15px' }}>
                        Download and prepare the ITC-01 form when offline.
                        <br />
                        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', color: '#0056b3', textDecoration: 'none', fontWeight: '500', marginTop: '5px', fontSize: '15px' }}>
                            Download 
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px' }}>
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    </li>
                    <li style={{ marginBottom: '8px' }}>Edit the generated file using import option</li>
                    <li style={{ marginBottom: '8px' }}>Prepare ITC-01 using excel when offline</li>
                    <li style={{ marginBottom: '8px' }}>Generate output file in .Json format</li>
                    <li style={{ marginBottom: '8px' }}>Upload output file in GST portal</li>
                </ol>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>
                    Zip contains:
                </h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>ITC01 excel</li>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>ReadMe</li>
                    <li style={{ listStyleType: 'disc' }}>Release Note</li>
                </ul>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>
                    System Requirement:
                </h3>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ marginBottom: '8px' }}>Windows 7 or above</li>
                    <li style={{ marginBottom: '8px' }}>Browser: Internet Explorer 10+, Google Chrome 49+, Firefox 45+</li>
                    <li>Microsoft Excel 2007 & above</li>
                </ol>
            </div>
        </div>
    );
};

export default ITC01OfflineTool;
