import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../pages/BusinessDetails.css';
import RegistrationCreditWidget from './RegistrationCreditWidget';
import InsufficientCreditsModal from './InsufficientCreditsModal';

const SUB_MENUS = {
    services: [
        { label: 'Registration', to: '/registration' },
        { label: 'Payments', to: '#' },
        { label: 'User Services', to: '#' },
        { label: 'Refunds', to: '#' },
        { label: 'e-Way Bill System', to: '#' },
        { label: 'Track Application Status', to: '#' },
    ],
    downloads: [
        { label: 'Offline Tools', to: '#' },
        { label: 'GST Statistics', to: '#' },
    ],
    search: [
        { label: 'Search by GSTIN/UIN', to: '#' },
        { label: 'Search by PAN', to: '#' },
        { label: 'Search Temporary ID', to: '#' },
        { label: 'Search Composition Taxpayer', to: '#' },
    ],
};

// Tab definitions shared across all registration pages
export const TABS = [
    { label: 'Business\nDetails', path: '/business-details' },
    { label: 'Promoter /\nPartners', path: '/promoter-partners' },
    { label: 'Authorized\nSignatory', path: '/authorized-signatory' },
    { label: 'Authorized\nRepresentative', path: '/authorized-representative' },
    { label: 'Principal Place\nof Business', path: '/principal-place-of-business' },
    { label: 'Additional\nPlaces of\nBusiness', path: '/additional-places-of-business' },
    { label: 'Goods and\nServices', path: '/goods-and-services' },
    { label: 'State Specific\nInformation', path: '/state-specific-information' },
    { label: 'Aadhaar\nAuthentication', path: '/aadhaar-authentication' },
    { label: 'Verification', path: '/verification' },
];

// SVG icons for each tab — faithful replicas of the official GST portal icons
const ICONS = [
    // 0 · Business Details — briefcase
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="7" y="15" width="26" height="18" rx="2" />
        <path d="M14 15v-3a2 2 0 012-2h8a2 2 0 012 2v3" />
        <line x1="7" y1="24" x2="33" y2="24" />
        <line x1="20" y1="20" x2="20" y2="28" />
    </svg>,

    // 1 · Promoter / Partners — two person silhouettes
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="14" cy="13" r="5" />
        <path d="M4 33c0-6 4-10 10-10" />
        <circle cx="26" cy="13" r="5" />
        <path d="M26 23c6 0 10 4 10 10" />
    </svg>,

    // 2 · Authorized Signatory — person + pen/signature
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="16" cy="13" r="5" />
        <path d="M6 33c0-6 4-10 10-10h2" />
        <path d="M27 22l7-7 3 3-7 7z" strokeLinejoin="round" />
        <path d="M25 36h8" strokeLinecap="round" />
        <path d="M33 29l2 7" strokeLinecap="round" />
    </svg>,

    // 3 · Authorized Representative — person + clipboard/badge
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="15" cy="12" r="5" />
        <path d="M5 32c0-6 4-9 10-9" />
        <rect x="24" y="18" width="12" height="16" rx="2" />
        <line x1="27" y1="23" x2="33" y2="23" />
        <line x1="27" y1="27" x2="33" y2="27" />
        <line x1="27" y1="31" x2="31" y2="31" />
    </svg>,

    // 4 · Principal Place of Business — location pin
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 5c-5.5 0-10 4.5-10 10 0 8 10 20 10 20S30 23 30 15c0-5.5-4.5-10-10-10z" />
        <circle cx="20" cy="15" r="3.5" />
    </svg>,

    // 5 · Additional Places of Business — two location pins
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M13 4c-4 0-7 3-7 7 0 5.5 7 14 7 14S20 16.5 20 11c0-4-3-7-7-7z" />
        <circle cx="13" cy="11" r="2.5" />
        <path d="M27 11c-3 0-5 2.5-5 5 0 4.5 5 11 5 11s5-6.5 5-11c0-2.5-2-5-5-5z" />
        <circle cx="27" cy="16" r="2" />
    </svg>,

    // 6 · Goods and Services — price tag / shopping tag
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 6h-8a2 2 0 00-2 2v8l14 14a2 2 0 002.8 0l7.2-7.2a2 2 0 000-2.8L20 6z" />
        <circle cx="14" cy="14" r="1.8" fill="currentColor" stroke="none" />
    </svg>,

    // 7 · State Specific Information — document with grid lines
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="6" y="5" width="28" height="30" rx="2" />
        <line x1="6" y1="14" x2="34" y2="14" />
        <line x1="6" y1="22" x2="34" y2="22" />
        <line x1="6" y1="30" x2="34" y2="30" />
        <line x1="18" y1="5" x2="18" y2="35" />
    </svg>,

    // 8 · Aadhaar Authentication — fingerprint
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 30c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        <path d="M8 24c0-6.6 5.4-12 12-12s12 5.4 12 12" />
        <path d="M4 20C4 11.2 11.2 4 20 4s16 7.2 16 16" />
        <line x1="20" y1="22" x2="20" y2="36" />
    </svg>,

    // 9 · Verification — circle with checkmark
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="20" r="14" />
        <path d="M12 20l6 6 10-12" />
    </svg>,
];


/**
 * Shared layout wrapper for all registration tab pages.
 *
 * Props:
 *   activeIndex  – index of the currently active tab (0-9)
 *   breadcrumb   – last breadcrumb label, e.g. "Promoter / Partners"
 *   children     – page-specific form content
 */
const RegistrationTabPage = ({ activeIndex, breadcrumb, children }) => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState(null);
    const [showCreditModal, setShowCreditModal] = useState(false);

    useEffect(() => {
        // Global interceptor for this page to catch 402 Insufficient Credits
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 402) {
                    setShowCreditModal(true);
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const expiryDate = localStorage.getItem('gst_expiry_date') || '—';
    const lastModified = localStorage.getItem('gst_reg_date') || '—';

    const tabProgress = parseInt(localStorage.getItem('gst_tab_progress') || '0', 10);
    let completedTabs = [];
    try {
        completedTabs = JSON.parse(localStorage.getItem('gst_completed_tabs') || '[]');
    } catch (e) { }

    // Returns the correct CSS class: active | completed | default
    const getTabClass = (i) => {
        if (i === activeIndex) return 'bd-tab active';
        if (completedTabs.includes(i)) return 'bd-tab completed';
        if (i < tabProgress) return 'bd-tab completed';
        return 'bd-tab';
    };

    return (
        <div className="bd-page" onClick={() => setActiveMenu(null)}>
            <RegistrationCreditWidget />
            <InsufficientCreditsModal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} />

            {/* Breadcrumb */}
            <div className="bd-breadcrumb">
                <div>
                    <span className="bd-bc-link" onClick={() => navigate('/')}>Home</span>
                    <span className="bd-bc-sep"> &gt; </span>
                    <span className="bd-bc-active">{breadcrumb}</span>
                </div>
                <span className="bd-lang">🌐 English</span>
            </div>

            <div className="bd-content-area">
                {/* Alert Banner */}
                <div className="bd-alert">
                    <span className="bd-alert-text">
                        Please complete Aadhaar OTP authentication on the GST portal.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        Please complete Aadhaar OTP authentication on the GST portal.
                    </span>
                </div>

                {/* Application Summary */}
                <div className="bd-summary">
                    <div className="bd-summary-item">
                        <div className="bd-s-label">Application Type</div>
                        <div className="bd-s-value">New Registration</div>
                    </div>
                    <div className="bd-summary-item">
                        <div className="bd-s-label">Due Date to Complete</div>
                        <div className="bd-s-value">{expiryDate}</div>
                    </div>
                    <div className="bd-summary-item">
                        <div className="bd-s-label">Last Modified</div>
                        <div className="bd-s-value">{lastModified}</div>
                    </div>
                    <div className="bd-summary-item">
                        <div className="bd-s-label">Profile</div>
                        <div className="bd-s-value">0%</div>
                    </div>
                </div>

                {/* Icon Tabs */}
                <div className="bd-tabs-wrapper">
                    <div className="bd-tabs">
                        {TABS.map((tab, i) => (
                            <div
                                key={i}
                                className={getTabClass(i)}
                                title={tab.label.replace(/\n/g, ' ')}
                                onClick={() => navigate(tab.path)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="bd-tab-icon">{ICONS[i]}</div>
                                <div className="bd-tab-label">{tab.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Page-specific content */}
                <div className="bd-form-wrapper">
                    <div className="bd-mandatory-note">
                        <span className="red-dot">●</span> Indicates mandatory fields
                    </div>
                    {children}
                </div>
            </div>

            {/* Footer */}
            <div className="bd-footer">
                <div>© 2025-26 Goods and Services Tax Network</div>
                <div>Site Last Updated on 30-01-2026</div>
                <div>Designed &amp; Developed by GSTN</div>
            </div>
            <div className="bd-footer-sub">
                Site best viewed at 1024 x 768 resolution in Microsoft Edge, Google Chrome 49+, Firefox 45+ and Safari 6+
            </div>
        </div>
    );
};

export default RegistrationTabPage;
