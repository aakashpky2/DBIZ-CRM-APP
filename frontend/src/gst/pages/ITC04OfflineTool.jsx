import React from 'react';
import { Link } from 'react-router-dom';

const ITC04OfflineTool = () => {
    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 120px', minHeight: 'calc(100vh - 200px)' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Downloads</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>ITC-04</span>
            </div>

            {/* Main Content Box */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    ITC-04 Offline Tool
                </h2>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>
                    Who should fill GST ITC-04 form?
                </h3>
                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '15px', fontSize: '15px' }}>
                    Manufacturer need to declare the details in ITC-04 in either or all the situations:
                </p>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '20px' }}>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>If the manufacturer is sending any goods (capital or input type) to a Job Worker</li>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>Job Worker sends back the goods to the manufacturer</li>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>Job Worker sends goods to another Job Worker</li>
                    <li style={{ listStyleType: 'disc' }}>Job Worker sends goods out from his business premises to end customer</li>
                </ul>

                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '15px', fontSize: '15px' }}>
                    This offline tool helps manufacturer to:
                </p>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>Prepare ITC-04 when offline (i.e. without Internet)</li>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>Upload bulk invoices/other details to GST portal</li>
                    <li style={{ listStyleType: 'disc' }}>Edit the generated file using import</li>
                </ul>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>
                    How do I prepare the form when offline
                </h3>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ marginBottom: '15px' }}>
                        Download and prepare the ITC-04 form when offline.
                        <br />
                        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', color: '#0056b3', textDecoration: 'none', fontWeight: '500', marginTop: '5px', fontSize: '15px' }}>
                            Download 
                            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px' }}>
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                        
                        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                            <h4 style={{ color: '#001b5c', fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Important!</h4>
                            <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', listStyleType: 'disc' }}>
                                <li>Before you extract and run the downloaded file, ensure that the file is not corrupted.</li>
                                <li>Click <a href="#" style={{ color: '#0056b3' }}>here</a> to know more.</li>
                                <li>Go through the <strong>Readme</strong> document before you begin installation.</li>
                                <li>Double-click on <strong>ITC-04 Offline Tool</strong> to open the offline tool.</li>
                            </ul>
                        </div>
                    </li>
                    <li style={{ marginBottom: '8px' }}>Edit the generated file using import option</li>
                    <li style={{ marginBottom: '8px' }}>Prepare ITC-04 using excel when offline (i.e. without Internet)</li>
                    <li style={{ marginBottom: '8px' }}>Generate the output file in .Json file format</li>
                    <li style={{ marginBottom: '8px' }}>Using the output file, upload it in GST portal (www.gst.gov.in) when online</li>
                </ol>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>
                    Your downloaded (ITC-04 Offline Tool) zip file contains:
                </h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>ITC04 excel</li>
                    <li style={{ listStyleType: 'disc', marginBottom: '5px' }}>ReadMe</li>
                    <li style={{ listStyleType: 'disc' }}>Release Note</li>
                </ul>

                <h3 style={{ color: '#001b5c', fontSize: '18px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>
                    System Requirement
                </h3>
                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '15px', fontSize: '15px' }}>
                    To use the tool efficiently, ensure that you have the following installed on your system:
                </p>
                <ol style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#333', fontSize: '15px', marginBottom: '30px' }}>
                    <li style={{ marginBottom: '15px' }}>
                        Operating system ➜ Windows 7 or above.
                        <br />
                        The tool does not work on Linux and Mac.
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                        Browser:
                        <ul style={{ paddingLeft: '20px', marginTop: '8px', listStyleType: 'disc' }}>
                            <li>Internet Explorer 10+</li>
                            <li>Google Chrome 49+</li>
                            <li>Firefox 45+</li>
                        </ul>
                    </li>
                    <li>Microsoft Excel 2007 & above</li>
                </ol>
            </div>
        </div>
    );
};

export default ITC04OfflineTool;
