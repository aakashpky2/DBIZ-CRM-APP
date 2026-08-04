import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GSTR2ADashboard.css';

const GSTR2ADashboard = () => {
    const navigate = useNavigate();
    const [taxpayerInfo, setTaxpayerInfo] = useState({
        gstin: '',
        legalName: '',
        tradeName: '',
        financialYear: '2025-26',
        returnPeriod: 'March'
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';
                const userRes = await api.get('/auth/me');
                if (userRes.data?.success && userRes.data?.data) {
                    const u = userRes.data.data;
                    setTaxpayerInfo(prev => ({
                        ...prev,
                        gstin: u.gstin || u.pan || trn,
                        legalName: u.legal_name || 'GST USER',
                        tradeName: u.trade_name || ''
                    }));
                }
            } catch (err) {
                console.warn('Profile load failed:', err.message);
            }
        };
        loadData();
    }, []);

    const cardsA = [
        { title: 'B2B Invoices', route: '/returns/gstr2a/b2b-invoices' },
        { title: 'Credit/Debit Notes', route: '/returns/gstr2a/credit-debit-notes' },
        { title: 'Amendments to B2B Invoices', route: '/returns/gstr2a/amendments-b2b' },
        { title: 'Amendments to Credit/Debit Notes', route: '/returns/gstr2a/amendments-credit-debit' },
        { title: 'ECO Documents', route: '/returns/gstr2a/eco-documents' },
        { title: 'Amendments to ECO Documents', route: '/returns/gstr2a/amendments-eco-documents' }
    ];

    const cardsB = [
        { title: 'ISD Credits', route: '/returns/gstr2a/isd-credits' },
        { title: 'Amendments to ISD Credits', route: '/returns/gstr2a/amendments-isd-credits' }
    ];

    const cardsC = [
        { title: 'TDS Credits', route: '/returns/gstr2a/tds-credits' },
        { title: 'Amendments to TDS Credits', route: '/returns/gstr2a/amendments-tds-credits' },
        { title: 'TCS Credits', route: '/returns/gstr2a/tcs-credits' }
    ];

    const cardsD = [
        { title: 'Import of goods from overseas on bill of entry', route: '/returns/gstr2a/import-goods-overseas' },
        { title: 'Import of goods from SEZ units / developers on bill of entry', route: '/returns/gstr2a/import-sez' }
    ];

    return (
        <div className="gstr2a-page">
            <div className="gstr2a-breadcrumb">
                <Link to="/dashboard">Dashboard</Link>
                <span>›</span>
                <Link to="/returns-dashboard">Returns</Link>
                <span>›</span>
                <span>GSTR2A</span>
            </div>

            <div className="gstr2a-container">
                <div className="gstr2a-header-teal">
                    GSTR2A - AUTO DRAFTED DETAILS
                </div>

                <div className="gstr2a-details-box">
                    <div className="gstr2a-details-grid">
                        <div className="detail-item"><strong>GSTIN</strong><br />{taxpayerInfo.gstin || '...'}</div>
                        <div className="detail-item"><strong>Legal Name</strong><br />{taxpayerInfo.legalName || '...'}</div>
                        <div className="detail-item"><strong>Trade Name</strong><br />{taxpayerInfo.tradeName || '-'}</div>
                        <div className="detail-item"><strong>Financial Year</strong><br />{taxpayerInfo.financialYear}</div>
                        <div className="detail-item"><strong>Return Period</strong><br />{taxpayerInfo.returnPeriod}</div>
                    </div>
                </div>

                <div className="gstr2a-info-section">
                    <div className="gstr2a-note-red">
                        <strong>NOTE:</strong> You can only view details of inward supplies in GSTR-2A
                    </div>
                    <div className="gstr2a-note-secondary">
                        In case supplier is regular taxpayer, the filing status and date will be based on data saved or filed in GSTR1A otherwise based on GSTR1.
                    </div>
                </div>

                <div className="gstr2a-part-container">
                    <div className="gstr2a-part-header">
                        <h2>PART-A</h2>
                        <span className="gstr2a-important-notice">Important Notice: If the invoices are more than 500, please check here</span>
                    </div>
                    <div className="gstr2a-card-grid-2">
                        {cardsA.map((card, i) => (
                            <div key={i} className="gstr2a-nav-btn" onClick={() => navigate(card.route)}>
                                {card.title}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="gstr2a-part-container">
                    <div className="gstr2a-part-header">
                        <h2>PART-B</h2>
                    </div>
                    <div className="gstr2a-card-grid-2">
                        {cardsB.map((card, i) => (
                            <div key={i} className="gstr2a-nav-btn" onClick={() => navigate(card.route)}>
                                {card.title}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="gstr2a-part-container">
                    <div className="gstr2a-part-header">
                        <h2>PART-C</h2>
                    </div>
                    <div className="gstr2a-card-grid-3">
                        {cardsC.map((card, i) => (
                            <div key={i} className="gstr2a-nav-btn" onClick={() => navigate(card.route)}>
                                {card.title}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="gstr2a-part-container">
                    <div className="gstr2a-part-header">
                        <h2>PART-D</h2>
                    </div>
                    <div className="gstr2a-card-grid-2">
                        {cardsD.map((card, i) => (
                            <div key={i} className="gstr2a-nav-btn" onClick={() => navigate(card.route)}>
                                {card.title}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="gstr2a-footer">
                <div className="footer-content">
                    <div className="footer-links">
                        <span>Copyright © Goods and Services Tax Network</span>
                        <span>Site Last Updated</span>
                    </div>
                    <div className="footer-right">
                        <span>Designed & Developed by GSTN</span>
                        <span>Site best viewed at 1024 x 768 resolution in Microsoft Edge, Mozilla Firefox 43.0+, Google Chrome 49.0+, and Safari 9.0+</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default GSTR2ADashboard;
