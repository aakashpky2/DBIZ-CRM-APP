import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import RegistrationTabPage from '../components/RegistrationTabPage';
import { useFormSave } from '../hooks/useFormSave';
import './PromoterPartners.css';
import './AuthorizedRepresentative.css';

const DESIGNATION_OPTIONS = [
    'Select',
    'Proprietor',
    'Partner',
    'Managing Director',
    'Authorized Signatory',
    'Director',
    'Manager',
    'Secretary',
    'Any other',
];

const AuthorizedRepresentative = () => {
    const navigate = useNavigate();
    const { handleSaveAndContinue, isSaving } = useFormSave('AuthorizedRepresentative', '/principal-place-of-business');
    const [hasRep, setHasRep] = useState(false);
    const [repType, setRepType] = useState('GST Practitioner');

    const [form, setForm] = useState({
        enrolmentId: '',
        firstName: '', middleName: '', lastName: '',
        designation: '',
        mobile: '', email: '',
        pan: '', aadhaar: '',
        stdTel: '', telephone: '',
        stdFax: '', fax: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <RegistrationTabPage activeIndex={3} breadcrumb="Authorized Representative">
            <Toaster position="top-right" />

            <h2 className="bd-section-title" style={{ marginBottom: '10px' }}>
                Details of Authorized Representative
            </h2>

            <div className="pp-section">
                <div style={{ padding: '18px 20px' }}>

                    {/* ── Toggle ─────────────────────────────────── */}
                    <label className="bd-label" style={{ marginBottom: '10px', display: 'block' }}>
                        Do you have any Authorized Representative?
                    </label>
                    <div className="bd-toggle-group" style={{ marginBottom: hasRep ? '20px' : 0 }}>
                        <div
                            className={`bd-toggle ${hasRep ? 'on' : ''}`}
                            onClick={() => setHasRep(v => !v)}
                        >
                            <input
                                type="checkbox"
                                name="hasRepresentative"
                                checked={hasRep}
                                onChange={e => setHasRep(e.target.checked)}
                                style={{ display: 'none' }}
                            />
                            <div className="bd-toggle-knob" />
                        </div>
                        <span className="bd-toggle-label">{hasRep ? 'Yes' : 'No'}</span>
                    </div>

                    {/* ── Expanded form (visible only when Yes) ──── */}
                    {hasRep && (
                        <>
                            {/* Type of Authorised Representative */}
                            <div className="ar-type-row">
                                <input
                                    type="hidden"
                                    name="repType"
                                    value={repType}
                                />
                                <div className="ar-type-label">Type of Authorised Representative</div>
                                <div className="ar-type-radios">
                                    {['GST Practitioner', 'Other'].map(t => (
                                        <label key={t} className={`ar-radio-opt ${repType === t ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="repType"
                                                value={t}
                                                checked={repType === t}
                                                onChange={() => setRepType(t)}
                                            />
                                            {t}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Enrolment ID + SEARCH (only for GST Practitioner) */}
                            {repType === 'GST Practitioner' && (
                                <div className="ar-enrolment-row">
                                    <div className="bd-form-group" style={{ flex: 1, maxWidth: 360 }}>
                                        <label className="bd-label">
                                            Enrolment ID <span className="red-dot">*</span>
                                        </label>
                                        <div className="ar-search-row">
                                            <input
                                                className="bd-input"
                                                name="enrolmentId"
                                                value={form.enrolmentId}
                                                onChange={handleChange}
                                                placeholder="Enter Enrolment ID"
                                            />
                                            <button className="ar-search-btn">SEARCH</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Name of Person */}
                            <div className="ar-sub-label">Name of Person</div>
                            <div className="bd-form-row three-col" style={{ padding: 0, marginBottom: 14 }}>
                                <div className="bd-form-group">
                                    <label className="bd-label">First Name</label>
                                    <input className="bd-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Enter First Name" />
                                </div>
                                <div className="bd-form-group">
                                    <label className="bd-label">Middle Name</label>
                                    <input className="bd-input" name="middleName" value={form.middleName} onChange={handleChange} placeholder="Enter Middle Name" />
                                </div>
                                <div className="bd-form-group">
                                    <label className="bd-label">Last Name</label>
                                    <input className="bd-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter Last Name" />
                                </div>
                            </div>

                            {/* Designation / Mobile / Email */}
                            <div className="bd-form-row three-col" style={{ padding: 0, marginBottom: 14 }}>
                                <div className="bd-form-group">
                                    <label className="bd-label">Designation / Status</label>
                                    <select className="bd-select" name="designation" value={form.designation} onChange={handleChange}>
                                        {DESIGNATION_OPTIONS.map(o => (
                                            <option key={o} value={o === 'Select' ? '' : o}>{o}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="bd-form-group">
                                    <label className="bd-label">📱 Mobile Number</label>
                                    <div className="pp-mobile-row">
                                        <span className="pp-country-code">+91</span>
                                        <input className="bd-input" name="mobile" value={form.mobile} onChange={handleChange} placeholder="Enter Mobile Number" maxLength={10} />
                                    </div>
                                </div>
                                <div className="bd-form-group">
                                    <label className="bd-label">🔒 Email Address</label>
                                    <input type="email" className="bd-input" name="email" value={form.email} onChange={handleChange} placeholder="Enter Email Address" />
                                </div>
                            </div>

                            {/* PAN / Aadhaar */}
                            <div className="bd-form-row" style={{ padding: 0, marginBottom: 14 }}>
                                <div className="bd-form-group">
                                    <label className="bd-label">Permanent Account Number (PAN) <span className="red-dot">*</span></label>
                                    <input className="bd-input" name="pan" value={form.pan} onChange={handleChange}
                                        placeholder="Enter Permanent Account Number (PAN)"
                                        maxLength={10} style={{ textTransform: 'uppercase' }} />
                                </div>
                                <div className="bd-form-group">
                                    <label className="bd-label">Aadhaar Number ⓘ</label>
                                    <input className="bd-input" name="aadhaar" value={form.aadhaar} onChange={handleChange}
                                        placeholder="Enter Aadhaar Number" maxLength={12} />
                                </div>
                            </div>

                            {/* Telephone / FAX */}
                            <div className="bd-form-row" style={{ padding: 0, marginBottom: 4 }}>
                                <div className="bd-form-group">
                                    <label className="bd-label">📞 Telephone Number (with STD Code)</label>
                                    <div className="pp-mobile-row">
                                        <input className="bd-input pp-std" name="stdTel" value={form.stdTel} onChange={handleChange} placeholder="STD" />
                                        <input className="bd-input" name="telephone" value={form.telephone} onChange={handleChange} placeholder="Telephone Number" />
                                    </div>
                                </div>
                                <div className="bd-form-group">
                                    <label className="bd-label">🖨️ FAX Number (with STD Code)</label>
                                    <div className="pp-mobile-row">
                                        <input className="bd-input pp-std" name="stdFax" value={form.stdFax} onChange={handleChange} placeholder="STD" />
                                        <input className="bd-input" name="fax" value={form.fax} onChange={handleChange} placeholder="Fax Number" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bd-actions">
                <button className="bd-back-btn" onClick={() => navigate('/authorized-signatory')}>BACK</button>
                <button className="bd-save-btn" onClick={handleSaveAndContinue} disabled={isSaving}>
                    {isSaving ? 'SAVING...' : 'SAVE & CONTINUE'}
                </button>
            </div>

        </RegistrationTabPage>
    );
};

export default AuthorizedRepresentative;
