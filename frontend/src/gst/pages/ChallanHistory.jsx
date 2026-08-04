import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CreateChallan.css';

const ChallanHistory = () => {
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('cpin');
    const [cpinInput, setCpinInput] = useState('');

    const sampleRows = [
        { cpin: '26063200162926', createdOn: '19/06/2026 16:08:01', amount: '460', mode: 'E-Payment', reason: 'AOP', expiry: '04/07/2026', depositDate: '19/06/2026', status: 'PAID' },
        { cpin: '26063200162868', createdOn: '19/06/2026 16:07:19', amount: '460', mode: 'E-Payment', reason: 'AOP', expiry: '04/07/2026', depositDate: '-', status: 'FAILED' },
        { cpin: '26063200037454', createdOn: '12/06/2026 18:16:53', amount: '1,200', mode: 'E-Payment', reason: 'AOP', expiry: '27/06/2026', depositDate: '12/06/2026', status: 'PAID' },
    ];

    return (
        <div className="cc-container" style={{ maxWidth: '1200px' }}>
            {/* Breadcrumb Bar */}
            <div className="cc-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <span>Payment</span>
                <span>&gt;</span>
                <span>Challan History</span>
            </div>

            <div className="cc-content-box">
                {/* Tabs */}
                <div className="cc-tabs-container">
                    <div className="cc-tab" onClick={() => navigate('/payment/create-challan')}>Create Challan</div>
                    <div className="cc-tab" onClick={() => navigate('/payment/saved-challan')}>Saved Challan</div>
                    <div className="cc-tab active">Challan History</div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <input type="radio" name="searchType" value="cpin" checked={searchType === 'cpin'} onChange={(e) => setSearchType(e.target.value)} />
                        Search By CPIN
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <input type="radio" name="searchType" value="date" checked={searchType === 'date'} onChange={(e) => setSearchType(e.target.value)} />
                        Search By Date
                    </label>
                </div>

                <div className="ch-green-alert">
                    Kindly search the CPIN to retrieve its latest payment status from bank.
                </div>

                <div style={{ textAlign: 'right', marginBottom: '15px', fontSize: '13px', color: '#d32f2f' }}>
                    <span style={{ fontSize: '16px' }}>•</span> indicates mandatory fields
                </div>

                {searchType === 'cpin' && (
                    <div className="ch-search-row">
                        <div className="ch-search-group">
                            <label>CPIN <span style={{ color: '#d32f2f' }}>*</span></label>
                            <input type="text" placeholder="Enter CPIN" value={cpinInput} onChange={(e) => setCpinInput(e.target.value)} />
                        </div>
                    </div>
                )}

                <div className="ch-search-actions">
                    <button className="cc-btn cc-btn-primary">SEARCH</button>
                    <button className="cc-btn cc-btn-secondary">DOWNLOAD AS CSV</button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="cc-table ch-table">
                        <thead>
                            <tr>
                                <th>CPIN</th>
                                <th>Created On</th>
                                <th>Amount (₹)</th>
                                <th>Mode</th>
                                <th>Challan Reason</th>
                                <th>Expiry Date</th>
                                <th>Deposit Date</th>
                                <th>Deposit Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sampleRows.map((row, index) => (
                                <tr key={index}>
                                    <td style={{ color: '#167dc2', cursor: 'pointer', textDecoration: 'underline' }}>{row.cpin}</td>
                                    <td>{row.createdOn}</td>
                                    <td style={{ textAlign: 'right' }}>{row.amount}</td>
                                    <td>{row.mode}</td>
                                    <td>{row.reason}</td>
                                    <td>{row.expiry}</td>
                                    <td>{row.depositDate}</td>
                                    <td>{row.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="ch-footer-notes">
                    <ul>
                        <li>If amount is deducted from bank account and not reflected in electronic cash ledger, user may raise grievance under <strong>Services &gt; Payments &gt; Grievance against payment (GST PMT-07)</strong>.</li>
                        <li><strong>Awaiting Bank Confirmation</strong> note for e-payment.</li>
                        <li><strong>Awaiting Bank Clearance</strong> note for OTC payment.</li>
                        <li>Challan reason abbreviations: <strong>MPQR 35% Challan</strong>, <strong>MPQR Self assessed</strong>, <strong>AOP Any other payment</strong>.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ChallanHistory;
