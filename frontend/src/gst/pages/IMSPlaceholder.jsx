import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const IMSPlaceholder = () => {
    const navigate = useNavigate();

    return (
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="dashboard-breadcrumb-bar" style={{ padding: '10px 120px' }}>
                <span style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
                <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate('/returns-dashboard')}>Returns</span>
                <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span>
                <span style={{ color: '#4b5563' }}>IMS Dashboard</span>
            </div>

            <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px 20px' }}>
                <div style={{ backgroundColor: 'white', borderTop: '4px solid #ef4444', padding: '40px', borderRadius: '8px', maxWidth: '600px', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
                    <h2 style={{ color: '#1b2e4b', margin: '0 0 10px 0' }}>Invoice Management System (IMS)</h2>
                    <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '25px' }}>
                        This is a placeholder page for the IMS Dashboard. The Invoice Management System allows recipient taxpayers to Accept, Reject, or Keep Pending invoices submitted by suppliers, which dynamically updates their GSTR-2B credit draft statement.
                    </p>
                    <button 
                        style={{ padding: '12px 25px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}
                        onClick={() => navigate('/returns-dashboard')}
                    >
                        Return to Returns Center
                    </button>
                </div>
            </div>

            <footer className="dashboard-footer-bar" style={{ marginTop: 'auto' }}>
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 24-02-2026</div>
                <div className="footer-right">Designed & Developed by GSTN</div>
            </footer>
        </div>
    );
};

export default IMSPlaceholder;
