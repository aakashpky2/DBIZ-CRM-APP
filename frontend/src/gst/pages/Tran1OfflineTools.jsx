import React from 'react';
import { Link } from 'react-router-dom';

const Tran1OfflineTools = () => {
    // Reusable component for the download sections
    const ToolSection = ({ title, description }) => (
        <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#001b5c', fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                {title}
            </h3>
            {description && (
                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '10px', fontSize: '14px' }}>
                    {description}
                </p>
            )}
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', color: '#0056b3', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }}>
                Download 
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '5px' }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            </a>
        </div>
    );

    return (
        <div style={{ backgroundColor: '#f1f3f6', padding: '20px 120px', minHeight: 'calc(100vh - 200px)' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>Home</Link>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Downloads</span>
                <span style={{ color: '#4b5563', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>Tran-1 Offline Tools</span>
            </div>

            {/* Main Content Box */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: '3px solid #1eb3a6', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ color: '#001b5c', fontSize: '24px', fontWeight: '500', marginTop: 0, marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
                    Tran-1 Offline Tools
                </h2>

                <ToolSection 
                    title="1. Tran-1 5(b) Statutory Form CSV template"
                    description="If you have large number of records in section 5(b) of Tran-1(Transitional ITC/Stock Statement), Use this template to fill in the details."
                />
                
                <ToolSection 
                    title="2. Tran-1 6(a) Capital Goods - Central Tax EXCEL template"
                    description="If you have large number of records in section 6(a) of Tran-1(Transitional ITC/Stock Statement), Use this template to fill in the details and generate the JSON file for upload."
                />

                <ToolSection 
                    title="3. Tran-1 6(b) Capital Goods - State/UT Tax EXCEL template"
                    description="If you have large number of records in section 6(b) of Tran-1(Transitional ITC/Stock Statement), Use this template to fill in the details and generate the JSON file for upload."
                />

                <ToolSection 
                    title="4. Tran-1 7(a) Details of inputs held in stock or inputs contained in semi-finished or finished goods held in stock EXCEL template"
                    description="If you have large number of records in section 7(a) of Tran-1(Transitional ITC/Stock Statement), Use this template to fill in the details and generate JSON file for upload."
                />

                <ToolSection 
                    title="5. Tran-1 7(b) Details of the inputs held in stock - Eligible Duties and taxes/VAT/[ET] EXCEL template"
                />

                <ToolSection 
                    title="6. Tran-1 9(a) Details of Goods - Sent as Principal CSV template"
                />

                <ToolSection 
                    title="7. Tran-1 9(b) Details of Goods - Held in Stock CSV template"
                />
            </div>
        </div>
    );
};

export default Tran1OfflineTools;
