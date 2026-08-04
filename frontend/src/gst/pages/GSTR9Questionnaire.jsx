import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './GSTR1Dashboard.css';
import PageLoader from '../components/PageLoader';

const GSTR9Questionnaire = () => {
    const navigate = useNavigate();
    const [isNil, setIsNil] = useState('No');
    const [loading, setLoading] = useState(false);

    const handleRefresh = () => {
        setLoading(true);
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    return (
        <>
        <PageLoader loading={loading} />
        <div className="dashboard-container" style={{ backgroundColor: '#f1f3f6', minHeight: '100vh' }}>
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link> 
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span> 
                    <Link to="/returns/annual-return" style={{ textDecoration: 'none', color: '#3b82f6' }}>Annual Return</Link>
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span> 
                    <span style={{ color: '#4b5563' }}>GSTR9</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            <div className="gstr1-summary-content" style={{ padding: '20px 120px' }}>
                {/* Header Banner */}
                <div className="gstr1-header-banner" style={{ background: '#26a69a', padding: '10px 20px', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '500' }}>GSTR-9 Annual return for Normal taxpayers</h2>
                    <span style={{ color: 'white', cursor: 'pointer' }} onClick={handleRefresh}>↻</span>
                </div>

                {/* Info Block */}
                <div className="gstr1-info-block" style={{ backgroundColor: 'white', border: '1px solid #ddd', borderTop: 'none', padding: '15px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', fontSize: '14px', color: '#333' }}>
                    <div>
                        <p style={{ margin: '5px 0' }}><strong>GSTIN</strong> - 32AAICD8127A1Z4</p>
                        <p style={{ margin: '5px 0' }}><strong>Status</strong> - Not filed</p>
                    </div>
                    <div>
                        <p style={{ margin: '5px 0' }}><strong>Legal Name</strong> - D MIX MEDIA PRIVATE LIMITED</p>
                        <p style={{ margin: '5px 0' }}><strong>FY</strong> - 2024-25</p>
                    </div>
                    <div>
                        <p style={{ margin: '5px 0' }}><strong>Trade Name</strong> -</p>
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', border: '1px solid #ddd', marginTop: '20px', padding: '20px' }}>
                    <p style={{ fontSize: '15px', color: '#333', marginBottom: '20px' }}>Please answer the below question to view the relevant parts of the return:-</p>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5' }}>
                                <th style={{ border: '1px solid #ddd', padding: '10px', width: '50px' }}></th>
                                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Description</th>
                                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', width: '120px', fontWeight: 'bold' }}>Option</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', verticalAlign: 'top' }}>1</td>
                                <td style={{ border: '1px solid #ddd', padding: '15px' }}>
                                    <p style={{ margin: '0 0 10px 0', fontWeight: '500' }}>Do you want to file a Nil return?<span style={{ color: 'red' }}>*</span></p>
                                    <div style={{ color: 'blue', fontSize: '13px', lineHeight: '1.6' }}>
                                        <strong>Note:</strong> Nil return can be filed for the Financial year, if you have: -
                                        <ul style={{ listStyleType: 'disc', paddingLeft: '30px', margin: '10px 0' }}>
                                            <li>NOT made any outward supply (commonly known as sale); AND</li>
                                            <li>NOT received any goods/services (commonly known as purchase); AND</li>
                                            <li>NO other liability to report; AND</li>
                                            <li>NOT claimed any credit; AND</li>
                                            <li>NOT claimed any refund; AND</li>
                                            <li>NOT received any order creating demand</li>
                                        </ul>
                                    </div>
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'center', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '5px' }}>
                                            <input type="radio" value="Yes" checked={isNil === 'Yes'} onChange={(e) => setIsNil(e.target.value)} /> Yes
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '5px' }}>
                                            <input type="radio" value="No" checked={isNil === 'No'} onChange={(e) => setIsNil(e.target.value)} /> No
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px' }}>
                        <button 
                            className="gstr1-btn-outline" 
                            style={{ padding: '8px 25px', borderColor: '#2b4b7c', color: '#2b4b7c' }}
                            onClick={() => navigate('/returns/annual-return')}
                        >
                            BACK TO FILE RETURNS
                        </button>
                        <button 
                            className="gstr1-btn-primary" 
                            style={{ padding: '8px 25px', backgroundColor: '#2b4b7c' }}
                            onClick={() => {
                                // For teaching purposes, we could navigate further here later
                            }}
                        >
                            NEXT
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            {/* Footer Bar */}
            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on 24-01-2026</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>

            <div className="bottom-info-blue-bar">
                Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
            </div>
            
            <div className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <span>▲</span>
                <p>Top</p>
            </div>
        </div>
        </>
    );
};

export default GSTR9Questionnaire;
