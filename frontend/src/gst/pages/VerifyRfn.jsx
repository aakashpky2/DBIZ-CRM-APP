import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const VerifyRfn = () => {
    const [rfnNumber, setRfnNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const validateRfn = (value) => {
        if (!value) return 'Please enter Reference Number (RFN).';
        if (value.length < 8 || value.length > 50) return 'RFN must be between 8 and 50 characters long.';
        const regex = /^[a-zA-Z0-9\-\/]+$/;
        if (!regex.test(value)) return 'RFN can only contain letters, numbers, hyphen (-) and slash (/).';
        return '';
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        const validationError = validateRfn(rfnNumber);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setLoading(true);
        setResult(null);

        try {
            const response = await api.post('/rfn/verify', { rfn_number: rfnNumber.trim() });
            const data = response.data;

            if (data.success && data.data) {
                setResult(data.data);
            } else {
                setError(data.error || 'No document found for the entered RFN.');
            }
        } catch (err) {
            setError('Error verifying RFN. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Valid': return '#28a745'; // Green
            case 'Expired': return '#fd7e14'; // Orange
            case 'Cancelled': 
            case 'Revoked': return '#dc3545'; // Red
            case 'Under Review': return '#17a2b8'; // Blue
            default: return '#6c757d'; // Grey
        }
    };

    const downloadPDF = () => {
        if (!result) return;
        const doc = new jsPDF();
        doc.text('RFN Verification Details', 14, 15);
        
        const tableData = [
            ['Reference Number (RFN)', result.rfn_number],
            ['Document Type', result.document_type],
            ['Document Title', result.document_title],
            ['Issued By', result.issued_by],
            ['Officer Name', result.officer_name],
            ['Designation', result.officer_designation],
            ['State', result.state],
            ['GSTIN', result.gstin],
            ['Taxpayer Name', result.taxpayer_name],
            ['Issue Date', result.issue_date],
            ['Validity Date', result.validity_date || 'N/A'],
            ['Status', result.document_status],
            ['Remarks', result.remarks || 'N/A']
        ];

        doc.autoTable({
            body: tableData,
            startY: 20,
            theme: 'grid',
            styles: { fontSize: 11 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70 } }
        });
        
        doc.save(`RFN_Verification_${result.rfn_number}.pdf`);
    };

    const printDetails = () => {
        window.print();
    };

    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 80px', minHeight: 'calc(100vh - 200px)' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <span style={{ color: '#4b5563' }}>Dashboard</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Services</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>User Services</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Verify RFN</span>
            </div>

            {/* Main Content */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', margin: '0 0 20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    Verify RFN
                </h2>

                <div style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #1eb3a6', padding: '15px', marginBottom: '30px', fontSize: '14px', color: '#333' }}>
                    <strong>Note:</strong><br />
                    Reference Number (RFN) is a code that uniquely identifies a document issued by the tax officer to the taxpayer. The feature below can be used to verify RFN of document issued by State GST officer.
                </div>

                <form onSubmit={handleSearch} style={{ maxWidth: '500px', marginBottom: '40px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>
                            Enter Reference Number of the Document (RFN) <span style={{ color: '#d32f2f' }}>*</span>
                        </label>
                        <input 
                            type="text"
                            value={rfnNumber}
                            onChange={(e) => {
                                setRfnNumber(e.target.value);
                                if (e.target.value.trim()) setError('');
                            }}
                            placeholder="Enter Reference Number"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: `1px solid ${error ? '#d32f2f' : '#ccc'}`,
                                borderRadius: '4px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        {error && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '5px' }}>{error}</div>}
                    </div>

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
                        {loading ? 'SUBMITTING...' : 'SUBMIT'}
                    </button>
                </form>

                {result && (
                    <div style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#001b5c', fontSize: '18px' }}>Verification Result</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={printDetails} style={{ padding: '6px 15px', fontSize: '13px', cursor: 'pointer', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '3px' }}>PRINT DETAILS</button>
                                <button onClick={downloadPDF} style={{ padding: '6px 15px', fontSize: '13px', cursor: 'pointer', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '3px' }}>DOWNLOAD PDF</button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid #dee2e6' }}>
                            {[
                                ['Reference Number (RFN)', result.rfn_number],
                                ['Document Type', result.document_type],
                                ['Document Title', result.document_title],
                                ['Issued By', result.issued_by],
                                ['Officer Name', result.officer_name],
                                ['Designation', result.officer_designation],
                                ['State', result.state],
                                ['GSTIN', result.gstin],
                                ['Taxpayer Name', result.taxpayer_name],
                                ['Issue Date', result.issue_date],
                                ['Validity Date', result.validity_date || 'N/A'],
                                ['Remarks', result.remarks || '-']
                            ].map(([label, value], index) => (
                                <div key={label} style={{ display: 'flex', borderBottom: index < 10 ? '1px solid #dee2e6' : 'none', borderRight: index % 2 === 0 ? '1px solid #dee2e6' : 'none' }}>
                                    <div style={{ width: '40%', padding: '12px 15px', backgroundColor: '#f8f9fa', fontWeight: '500', fontSize: '13px', color: '#333' }}>{label}</div>
                                    <div style={{ width: '60%', padding: '12px 15px', fontSize: '13px', color: '#555' }}>{value}</div>
                                </div>
                            ))}
                            {/* Status row spanning full width or acting as last item */}
                            <div style={{ display: 'flex', borderTop: '1px solid #dee2e6', gridColumn: '1 / -1' }}>
                                <div style={{ width: '20%', padding: '12px 15px', backgroundColor: '#f8f9fa', fontWeight: '500', fontSize: '13px', color: '#333' }}>Status</div>
                                <div style={{ width: '80%', padding: '12px 15px', fontSize: '13px', color: '#555' }}>
                                    <span style={{ 
                                        backgroundColor: getStatusColor(result.document_status), 
                                        color: '#fff', 
                                        padding: '4px 10px', 
                                        borderRadius: '12px', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold' 
                                    }}>
                                        {result.document_status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyRfn;
