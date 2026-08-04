import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const GSTStatistics = () => {
    const [statistics, setStatistics] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const statRes = await api.get('/gst-statistics');
                const statData = statRes.data;
                
                const repRes = await api.get('/gst-statistics/reports');
                const repData = repRes.data;
                
                if (statData.success) setStatistics(statData.data);
                if (repData.success) setReports(repData.data);
            } catch (err) {
                console.error("Error fetching GST statistics:", err);
                setError("Failed to load statistics data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderDownloadIcon = (url) => {
        if (!url || url.trim() === '') return null;
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#0056b3', textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </a>
        );
    };

    return (
        <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Breadcrumb Area */}
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #ddd' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Link to="/" style={{ color: '#0056b3', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
                        <span style={{ color: '#666', margin: '0 8px', fontSize: '14px' }}>&gt;</span>
                        <span style={{ color: '#666', fontSize: '14px' }}>Downloads</span>
                        <span style={{ color: '#666', margin: '0 8px', fontSize: '14px' }}>&gt;</span>
                        <span style={{ color: '#333', fontSize: '14px', fontWeight: 'bold' }}>GST Statistics</span>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
                <h2 style={{ color: '#0f4c81', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>GST Statistics</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: '#0f4c81', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <p style={{ marginTop: '10px', color: '#666' }}>Loading Statistics...</p>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : error ? (
                    <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '4px' }}>{error}</div>
                ) : (
                    <>
                        <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', marginBottom: '30px' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#0f4c81', color: 'white', borderBottom: '1px solid #ddd' }}>
                                            <th rowSpan="2" style={{ padding: '12px', borderRight: '1px solid #1c6ba8', borderBottom: '1px solid #1c6ba8' }}>Financial Year</th>
                                            <th rowSpan="2" style={{ padding: '12px', borderRight: '1px solid #1c6ba8', borderBottom: '1px solid #1c6ba8' }}>Registration</th>
                                            <th colSpan="2" style={{ padding: '12px', borderRight: '1px solid #1c6ba8', borderBottom: '1px solid #1c6ba8' }}>Return</th>
                                            <th colSpan="2" style={{ padding: '12px', borderRight: '1px solid #1c6ba8', borderBottom: '1px solid #1c6ba8' }}>Tax Collection</th>
                                            <th rowSpan="2" style={{ padding: '12px', borderRight: '1px solid #1c6ba8', borderBottom: '1px solid #1c6ba8' }}>Settlement of IGST to State/UTs</th>
                                            <th rowSpan="2" style={{ padding: '12px', borderBottom: '1px solid #1c6ba8' }}>E-Way Bill</th>
                                        </tr>
                                        <tr style={{ backgroundColor: '#0f4c81', color: 'white' }}>
                                            <th style={{ padding: '10px', borderRight: '1px solid #1c6ba8', borderBottom: '1px solid #1c6ba8', fontSize: '14px' }}>GSTR-3B</th>
                                            <th style={{ padding: '10px', borderRight: '1px solid #1c6ba8', borderBottom: '1px solid #1c6ba8', fontSize: '14px' }}>GSTR-1</th>
                                            <th style={{ padding: '10px', borderRight: '1px solid #1c6ba8', borderBottom: '1px solid #1c6ba8', fontSize: '14px' }}>Gross and Net Tax Collection</th>
                                            <th style={{ padding: '10px', borderRight: '1px solid #1c6ba8', borderBottom: '1px solid #1c6ba8', fontSize: '14px' }}>State Wise Tax Collection</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {statistics.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" style={{ padding: '20px', color: '#666' }}>No Data Available</td>
                                            </tr>
                                        ) : (
                                            statistics.map((stat, index) => (
                                                <tr key={stat.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #ddd' }}>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #ddd', fontWeight: 'bold', color: '#333' }}>{stat.financial_year}</td>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>{renderDownloadIcon(stat.registration_file)}</td>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>{renderDownloadIcon(stat.gstr3b_file)}</td>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>{renderDownloadIcon(stat.gstr1_file)}</td>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>{renderDownloadIcon(stat.gross_net_collection_file)}</td>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>{renderDownloadIcon(stat.state_wise_collection_file)}</td>
                                                    <td style={{ padding: '12px', borderRight: '1px solid #ddd' }}>{renderDownloadIcon(stat.igst_settlement_file)}</td>
                                                    <td style={{ padding: '12px' }}>{renderDownloadIcon(stat.eway_bill_file)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {reports && reports.length > 0 && (
                            <div style={{ marginBottom: '30px' }}>
                                {reports.map(report => (
                                    <div key={report.id} style={{ backgroundColor: '#fff', padding: '15px 20px', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <div style={{ color: '#333', fontSize: '15px', fontWeight: '500' }}>{report.report_name}</div>
                                        <div>{renderDownloadIcon(report.report_file)}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', padding: '20px' }}>
                            <h3 style={{ color: '#d32f2f', margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>Note:</h3>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#444', fontSize: '14px', lineHeight: '1.6' }}>
                                <li><strong>E-way Bill:</strong> Started from 01/04/2018.</li>
                                <li>Click on relevant tab to download the file.</li>
                                <li><strong>Registration:</strong> The State-wise data having details of active taxpayers at the close of last month. This excludes those taxpayers whose registration has been cancelled but includes those taxpayers whose registration was restored on application/appeal.</li>
                                <li style={{ marginTop: '10px', listStyle: 'none', marginLeft: '-20px' }}>
                                    <strong>Tax Collection:</strong>
                                    <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                        <li>Tax data is divided into three parts viz. Tax Paid on GST Portal, IGST paid on Customs Portal and IGST settled to States/UTs.</li>
                                        <li>July 2017 being first month, there was no settlement and hence there is no data under the same.</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GSTStatistics;
