import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './ReturnsDashboard.css';

const AnnualReturn = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const toggleMenu = (menu) => {
        setActiveMenu(prev => (prev === menu ? null : menu));
    };

    const handleBackdropClick = () => {
        setActiveMenu(null);
    };

    const handleSearch = () => {
        setShowDetails(true);
    };

    return (
        <div className="dashboard-container" onClick={handleBackdropClick}>
            {/* Breadcrumb Bar */}
            <div className="dashboard-breadcrumb-bar">
                <div className="breadcrumb-left">
                    <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3b82f6' }}>Dashboard</Link> 
                    <span style={{ color: '#9ca3af', margin: '0 5px' }}>&gt;</span> 
                    <span style={{ color: '#4b5563' }}>Annual Return</span>
                </div>
                <div className="breadcrumb-right">
                    <span>🌐 English</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="returns-main-content" style={{ flexDirection: 'column', alignItems: 'center' }}>
                <div className="returns-card" style={{ minHeight: 'auto', marginBottom: '20px' }}>
                    <h2 className="returns-title">File Annual Returns</h2>

                    <div className="returns-mandatory-note" style={{ textAlign: 'right', marginBottom: '20px' }}>
                        <span className="red-dot">•</span> Indicates Mandatory Fields
                    </div>

                    <div className="returns-form-row" style={{ justifyContent: 'flex-start', alignItems: 'flex-end', gap: '20px', borderBottom: 'none', paddingBottom: '10px' }}>
                        <div className="returns-form-group" style={{ flex: '0 0 250px' }}>
                            <label className="returns-label">Financial Year <span className="red-dot">*</span></label>
                            <select className="returns-select" defaultValue="2024-25">
                                <option>2025-26</option>
                                <option>2024-25</option>
                                <option>2023-24</option>
                                <option>2022-23</option>
                                <option>2021-22</option>
                            </select>
                        </div>
                        <div className="returns-form-group" style={{ flex: 'none' }}>
                            <button className="returns-search-btn" style={{ height: '32px', padding: '0 20px', fontSize: '13px' }} onClick={handleSearch}>SEARCH</button>
                        </div>
                    </div>
                </div>

                {showDetails && (
                    <div style={{ width: '100%', maxWidth: '1280px', padding: '0 120px' }}>
                        {/* Help Box */}
                        <div style={{ border: '1px solid #2b4b7c', background: '#fff', padding: '20px', marginBottom: '20px', borderRadius: '4px' }}>
                            <h3 style={{ textAlign: 'center', color: '#1b2e4b', textDecoration: 'underline', marginBottom: '15px' }}>Help</h3>
                            <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#333' }}>
                                <strong>1. NIL GSTR-9 RETURN can be filed, if you have:</strong>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '40px' }}>
                                    <li>Not made any outward supply (commonly known as sale); AND</li>
                                    <li>Not received any inward supplies (commonly known as purchase) of goods/services; AND</li>
                                    <li>No liability of any kind; AND</li>
                                    <li>Not claimed any Credit during the Financial Year; AND</li>
                                    <li>Not received any order creating demand; AND</li>
                                    <li>Not claimed any refund.</li>
                                </ul>
                                <p style={{ paddingLeft: '20px' }}>during the Financial Year</p>
                                <p>2. GSTR-9 can be filed online. It can also be prepared on Offline tool and then uploaded on the Portal and filed.</p>
                                <p>3. Annual return in Form GSTR-9 is required to be filed by every taxpayer registered as normal taxpayer during the relevant financial year unless exempted by Government through notification.</p>
                                <p>4. All applicable statements of Forms GSTR-1/IFF and returns in Form GSTR-3B of the financial year should have been filed before filing GSTR-9.</p>
                                <p>5. In case, you are required to file GSTR-9C (Reconciliation statement and Certification), the same shall be enabled on the dashboard post filing of GSTR-9.</p>
                            </div>
                        </div>

                        {/* Red Alert Box */}
                        <div style={{ background: '#fdf2f2', border: '1px solid #f8d7da', padding: '15px 25px', marginBottom: '20px', borderRadius: '4px', fontSize: '13px', color: '#9b1c1c' }}>
                            <ol style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Annual return in Form GSTR-9 once filed cannot be revised.</li>
                                <li>Computation of ITC has been made based on GSTR-1/IFF/GSTR-5 filed by your corresponding suppliers upto 30/11/2025. GSTR-1/IFF/GSTR-5 filed after the updation date will be covered in the next updation.</li>
                            </ol>
                        </div>

                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                            <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                <div style={{ background: '#1b2e4b', color: '#fff', padding: '20px', textAlign: 'center' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Annual Return</h3>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>GSTR9</p>
                                </div>
                                <div style={{ padding: '60px 20px', textAlign: 'center', background: '#f1f3f6' }}>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <button className="returns-action-btn" style={{ minWidth: '140px' }} onClick={() => navigate('/returns/gstr9/questionnaire')}>PREPARE ONLINE</button>
                                        <button className="returns-action-btn" style={{ minWidth: '140px' }}>PREPARE OFFLINE</button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                <div style={{ background: '#1b2e4b', color: '#fff', padding: '20px', textAlign: 'center' }}>
                                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Reconciliation Statement</h3>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>GSTR 9C</p>
                                </div>
                                <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '15px', fontWeight: 'bold' }}>Due Date - <span style={{ color: '#26a69a' }}>31/12/2025</span></p>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                                        <button className="returns-action-btn" style={{ minWidth: '140px' }}>INITIATE FILING</button>
                                        <button className="returns-action-btn" style={{ minWidth: '140px' }}>PREPARE OFFLINE</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Important Message Section */}
                        <div style={{ background: '#fff', border: '1px solid #2b4b7c', marginBottom: '50px' }}>
                            <div style={{ background: '#2b4b7c', color: '#fff', padding: '10px 15px', fontWeight: 'bold', textAlign: 'center', fontSize: '14px' }}>
                                Important Message
                            </div>
                            <div style={{ padding: '20px', fontSize: '13px', color: '#333' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '14px' }}>Prepare Online:-</p>
                                <p style={{ fontWeight: 'bold' }}>Steps to be taken:</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '30px', color: '#333' }}>
                                    <li>Click on <strong>Prepare Online</strong>;</li>
                                    <li>Select from the questionnaire page, whether you wish to file NIL Annual return;</li>
                                    <li>You may download the draft of system generated GSTR-9, annual summary of GSTR-1/GSTR-1A/IFF and annual summary of GSTR-3B from GSTR-9 dashboard for reference.</li>
                                    <li>If number of records/lines are less than or equal to 500 records per table in Table 17 and Table 18, then you may use the online facility;</li>
                                    <li>Fill in the details in different tables and click on <strong>Compute Liabilities</strong>; and</li>
                                    <li>Click on <strong>Proceed to file</strong> and <strong>File GSTR-9</strong> with DSC/EVC.</li>
                                    <li>Additional liability, if any, declared in this return can be paid through Form GST DRC-03 by selecting as <strong>Annual Return</strong> from the cause of payment dropdown in the said form.</li>
                                </ul>
                                
                                <p style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '20px' }}>Prepare Offline:-</p>
                                <p>If number of records/lines either in Table-17 or Table-18 are more than 500 records per table, then you should prepare your return by using the offline utility only and the same can be subsequently uploaded on Common Portal.</p>
                                <p>You can download the GSTR-9 offline tool from the <strong>Downloads</strong> section in the pre-login page on the portal and install it on your computer.</p>
                                <ul style={{ listStyleType: 'disc', paddingLeft: '30px' }}>
                                    <li>Click on <strong>Prepare Offline</strong>;</li>
                                    <li>Click on <strong>Download</strong> to download auto-drafted GSTR-9 details, if any;</li>
                                    <li>Import downloaded json into offline tool;</li>
                                    <li>Follow instructions in <strong>GSTR-9 offline tool</strong> to add details and generate JSON file for upload; and</li>
                                    <li>Click on <strong>Upload</strong> to upload JSON file and file the return with the help of instruction available on GSTR-9 dashboard.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ flexGrow: 1 }}></div>

            {/* Footer Bar */}
            <footer className="dashboard-footer-bar">
                <div className="footer-left">© 2025-26 Goods and Services Tax Network</div>
                <div className="footer-center">Site Last Updated on</div>
                <div className="footer-right">Designed &amp; Developed by GSTN</div>
            </footer>

            <div className="bottom-info-blue-bar">
                Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
            </div>
            
            <div className="scroll-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <span>▲</span>
            </div>
        </div>
    );
};

export default AnnualReturn;
