import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageGstStatistics = () => {
    const [statistics, setStatistics] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state for new statistic
    const [statForm, setStatForm] = useState({
        financial_year: '',
        registration_file: '',
        gstr3b_file: '',
        gstr1_file: '',
        gross_net_collection_file: '',
        state_wise_collection_file: '',
        igst_settlement_file: '',
        eway_bill_file: ''
    });

    // Form state for new report
    const [reportForm, setReportForm] = useState({
        report_name: '',
        report_file: ''
    });

    const apiUrl = import.meta.env.VITE_GST_API_URL || '/api/gst';

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
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatChange = (e) => {
        setStatForm({ ...statForm, [e.target.name]: e.target.value });
    };

    const handleReportChange = (e) => {
        setReportForm({ ...reportForm, [e.target.name]: e.target.value });
    };

    const handleStatSubmit = async (e) => {
        e.preventDefault();
        if (!statForm.financial_year) return;

        try {
            const response = await api.post('/gst-statistics', statForm);
            const data = response.data;
            if (data.success) {
                setStatForm({
                    financial_year: '',
                    registration_file: '',
                    gstr3b_file: '',
                    gstr1_file: '',
                    gross_net_collection_file: '',
                    state_wise_collection_file: '',
                    igst_settlement_file: '',
                    eway_bill_file: ''
                });
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportForm.report_name || !reportForm.report_file) return;

        try {
            const response = await api.post('/gst-statistics/reports', reportForm);
            const data = response.data;
            if (data.success) {
                setReportForm({ report_name: '', report_file: '' });
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteStatistic = async (id) => {
        if (!window.confirm("Are you sure you want to delete this financial year?")) return;
        try {
            const response = await api.delete(`/gst-statistics/${id}`);
            const data = response.data;
            if (data.success) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteReport = async (id) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        try {
            const response = await api.delete(`/gst-statistics/reports/${id}`);
            const data = response.data;
            if (data.success) fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ color: '#001b5c', borderBottom: '2px solid #1eb3a6', paddingBottom: '10px' }}>Manage GST Statistics (Admin)</h1>
            
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
                <h3>Add / Update Financial Year Statistics</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Provide full URLs for the files. If updating an existing year, enter the year and fill the URLs to override.</p>
                
                <form onSubmit={handleStatSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>Financial Year (e.g. 2017-2018)*</label>
                        <input type="text" name="financial_year" value={statForm.financial_year} onChange={handleStatChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Registration File URL</label>
                        <input type="text" name="registration_file" value={statForm.registration_file} onChange={handleStatChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>GSTR-3B File URL</label>
                        <input type="text" name="gstr3b_file" value={statForm.gstr3b_file} onChange={handleStatChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>GSTR-1 File URL</label>
                        <input type="text" name="gstr1_file" value={statForm.gstr1_file} onChange={handleStatChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Gross/Net Collection URL</label>
                        <input type="text" name="gross_net_collection_file" value={statForm.gross_net_collection_file} onChange={handleStatChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>State Wise Collection URL</label>
                        <input type="text" name="state_wise_collection_file" value={statForm.state_wise_collection_file} onChange={handleStatChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>IGST Settlement URL</label>
                        <input type="text" name="igst_settlement_file" value={statForm.igst_settlement_file} onChange={handleStatChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>E-Way Bill URL</label>
                        <input type="text" name="eway_bill_file" value={statForm.eway_bill_file} onChange={handleStatChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                        <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#0f4c81', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Financial Year Data</button>
                    </div>
                </form>
            </div>

            {loading ? <p>Loading data...</p> : (
                <div style={{ overflowX: 'auto', marginBottom: '40px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#0f4c81', color: 'white' }}>
                                <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Financial Year</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Reg.</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>3B</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>GSTR-1</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Net Tax</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>State Tax</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>IGST</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>E-Way</th>
                                <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statistics.map(stat => (
                                <tr key={stat.id} style={{ backgroundColor: '#fff' }}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{stat.financial_year}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{stat.registration_file ? '✅' : '-'}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{stat.gstr3b_file ? '✅' : '-'}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{stat.gstr1_file ? '✅' : '-'}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{stat.gross_net_collection_file ? '✅' : '-'}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{stat.state_wise_collection_file ? '✅' : '-'}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{stat.igst_settlement_file ? '✅' : '-'}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{stat.eway_bill_file ? '✅' : '-'}</td>
                                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                        <button onClick={() => {
                                            setStatForm({
                                                financial_year: stat.financial_year || '',
                                                registration_file: stat.registration_file || '',
                                                gstr3b_file: stat.gstr3b_file || '',
                                                gstr1_file: stat.gstr1_file || '',
                                                gross_net_collection_file: stat.gross_net_collection_file || '',
                                                state_wise_collection_file: stat.state_wise_collection_file || '',
                                                igst_settlement_file: stat.igst_settlement_file || '',
                                                eway_bill_file: stat.eway_bill_file || ''
                                            });
                                            window.scrollTo(0,0);
                                        }} style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '3px', backgroundColor: '#f1f5f9' }}>
                                            Edit
                                        </button>
                                        <button onClick={() => deleteStatistic(stat.id)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '3px' }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
                <h3>Add Additional Report</h3>
                <form onSubmit={handleReportSubmit} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Report Name*</label>
                        <input type="text" name="report_name" value={reportForm.report_name} onChange={handleReportChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                    </div>
                    <div style={{ flex: 2 }}>
                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Report URL*</label>
                        <input type="url" name="report_file" value={reportForm.report_file} onChange={handleReportChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} required />
                    </div>
                    <button type="submit" style={{ padding: '9px 20px', backgroundColor: '#0f4c81', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Report</button>
                </form>
            </div>

            {!loading && reports.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#0f4c81', color: 'white' }}>
                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Report Name</th>
                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>File URL</th>
                            <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id} style={{ backgroundColor: '#fff' }}>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{report.report_name}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    <a href={report.report_file} target="_blank" rel="noopener noreferrer">{report.report_file}</a>
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    <button onClick={() => deleteReport(report.id)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '3px' }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageGstStatistics;
