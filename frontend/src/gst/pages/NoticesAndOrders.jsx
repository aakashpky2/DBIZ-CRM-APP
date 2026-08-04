import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NoticesAndOrders.css';

const NoticesAndOrders = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const sampleRows = [
        { id: 'ZA320526064850L', type: 'Notice', desc: 'Notice to return defaulter u/s 46 for not filing return', issueDate: '24/05/2026', dueDate: '08/06/2026', isBold: true },
        { id: 'ZA320426066556F', type: 'Notice', desc: 'Notice to return defaulter u/s 46 for not filing return', issueDate: '27/04/2026', dueDate: '12/05/2026', isBold: false },
        { id: 'ZA320425076686A', type: 'Notice', desc: 'Notice to return defaulter u/s 46 for not filing return', issueDate: '27/04/2025', dueDate: '12/05/2025', isBold: false },
    ];

    const handleClear = () => {
        setFromDate('');
        setToDate('');
    };

    const handleView = (id) => {
        alert(`Opening modal for: ${id}`);
    };

    return (
        <div className="no-container">
            {/* Breadcrumb Bar */}
            <div className="no-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <span>Services</span>
                <span>&gt;</span>
                <span>User Services</span>
                <span>&gt;</span>
                <span>View Notices and Orders</span>
            </div>

            {/* Filter Section */}
            <div className="no-card">
                <div className="no-card-title">View Notices and Orders</div>
                
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    <div className="no-info-text-right">
                        The “Additional Notices Orders” tab has now been merged with “Notices and Orders”.
                    </div>

                    <div className="no-filter-row">
                        <div className="no-form-group">
                            <label>Issuance Period</label>
                            <div className="no-date-inputs">
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', marginRight: '5px' }}>From</span>
                                    <input 
                                        type="date" 
                                        className="no-input" 
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', marginRight: '5px' }}>To</span>
                                    <input 
                                        type="date" 
                                        className="no-input" 
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="no-action-buttons">
                            <button className="no-btn no-btn-primary">SEARCH</button>
                            <button className="no-btn no-btn-secondary" onClick={handleClear}>CLEAR</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="no-card">
                <div className="no-card-title">List of Notices & Orders issued by Authorities</div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table className="no-table">
                        <thead>
                            <tr>
                                <th>
                                    Notice/Demand Order Id
                                    <div className="no-th-filter"><input type="text" /></div>
                                </th>
                                <th>
                                    Type
                                    <div className="no-th-filter"><input type="text" /></div>
                                </th>
                                <th>
                                    Notice / Order Description
                                    <div className="no-th-filter"><input type="text" /></div>
                                </th>
                                <th>
                                    Date of Issuance
                                    <div className="no-th-filter"><input type="text" /></div>
                                </th>
                                <th>
                                    Due Date
                                    <div className="no-th-filter"><input type="text" /></div>
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sampleRows.map((row, index) => (
                                <tr key={index} style={{ fontWeight: row.isBold ? 'bold' : 'normal' }}>
                                    <td>{row.id}</td>
                                    <td>{row.type}</td>
                                    <td>{row.desc}</td>
                                    <td>{row.issueDate}</td>
                                    <td>{row.dueDate}</td>
                                    <td>
                                        <span className="no-view-link" onClick={() => handleView(row.id)}>View</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Notes */}
                <div className="no-footer-notes">
                    <ul>
                        <li>If a record in the table is <strong>bold</strong>, it means new Notice/Order not yet viewed.</li>
                        <li>If Due Date shows <strong>Applicable</strong>, refer document for exact due date.</li>
                        <li>If Due Date shows <strong>NA</strong>, due date does not apply.</li>
                        <li><strong>Additional Notices Orders</strong> tab merged with Notices and Orders.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NoticesAndOrders;
