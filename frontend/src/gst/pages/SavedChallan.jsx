import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CreateChallan.css';

const SavedChallan = () => {
    const navigate = useNavigate();

    return (
        <div className="cc-container">
            {/* Breadcrumb Bar */}
            <div className="cc-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>&gt;</span>
                <span>Payment</span>
                <span>&gt;</span>
                <span>Saved Challan</span>
            </div>

            <div className="cc-content-box">
                {/* Tabs */}
                <div className="cc-tabs-container">
                    <div className="cc-tab" onClick={() => navigate('/payment/create-challan')}>Create Challan</div>
                    <div className="cc-tab active">Saved Challan</div>
                    <div className="cc-tab" onClick={() => navigate('/payment/challan-history')}>Challan History</div>
                </div>

                <div style={{ textAlign: 'center', padding: '50px', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>
                    No Records Found
                </div>
            </div>
        </div>
    );
};

export default SavedChallan;
